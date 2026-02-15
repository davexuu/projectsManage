import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { XMLParser } from "fast-xml-parser";
import { z } from "zod";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: false
});

const importSchema = z.object({
  filePath: z.string().min(1)
});

type AnyObject = Record<string, any>;

interface SheetInfo {
  name: string;
  target: string;
}

interface ImportPreview {
  summary: {
    sheets: string[];
    projects: number;
    wbs: number;
    milestones: number;
    progressRecords: number;
    statusAssessments: number;
    risks: number;
    changes: number;
  };
  data: {
    projects: AnyObject[];
    wbs: AnyObject[];
    milestones: AnyObject[];
    progressRecords: AnyObject[];
    statusAssessments: AnyObject[];
    risks: AnyObject[];
    changes: AnyObject[];
  };
}

const stageSet = new Set(["启动", "规划", "执行", "验收"]);
const trafficSet = new Set(["绿", "黄", "红"]);

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function colToNumber(col: string): number {
  let num = 0;
  for (const ch of col) {
    num = num * 26 + (ch.charCodeAt(0) - 64);
  }
  return num;
}

function splitCellRef(ref: string): { col: number; row: number } | null {
  const m = /^([A-Z]+)(\d+)$/.exec(ref);
  if (!m) return null;
  return { col: colToNumber(m[1]), row: Number(m[2]) };
}

function excelSerialToDateText(v: string): string {
  const num = Number(v);
  if (!Number.isFinite(num) || num < 1000) return v;
  const ms = (num - 25569) * 86400 * 1000;
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getSharedStrings(zip: AdmZip): string[] {
  const entry = zip.getEntry("xl/sharedStrings.xml");
  if (!entry) return [];

  const xml = entry.getData().toString("utf-8");
  const parsed = xmlParser.parse(xml);
  const sis = asArray(parsed?.sst?.si);

  return sis.map((si) => {
    if (typeof si?.t === "string") return si.t;
    const runs = asArray(si?.r);
    return runs.map((r) => (typeof r?.t === "string" ? r.t : "")).join("");
  });
}

function getSheets(zip: AdmZip): SheetInfo[] {
  const wbXml = zip.getEntry("xl/workbook.xml")?.getData().toString("utf-8") ?? "";
  const relXml = zip.getEntry("xl/_rels/workbook.xml.rels")?.getData().toString("utf-8") ?? "";
  if (!wbXml || !relXml) return [];

  const wb = xmlParser.parse(wbXml);
  const rel = xmlParser.parse(relXml);

  const rels = asArray(rel?.Relationships?.Relationship);
  const relMap = new Map<string, string>();
  rels.forEach((r) => {
    if (r?.Id && r?.Target) relMap.set(String(r.Id), String(r.Target));
  });

  const sheets = asArray(wb?.workbook?.sheets?.sheet);
  return sheets
    .map((s) => {
      const rid = s?.["r:id"];
      const target = rid ? relMap.get(String(rid)) : undefined;
      return {
        name: String(s?.name ?? ""),
        target: target ? `xl/${target.replace(/^\/+/, "")}` : ""
      };
    })
    .filter((s) => s.name && s.target);
}

function readSheetRows(zip: AdmZip, sheetPath: string, sharedStrings: string[]): Map<number, Map<number, string>> {
  const xml = zip.getEntry(sheetPath)?.getData().toString("utf-8");
  const rowsMap = new Map<number, Map<number, string>>();
  if (!xml) return rowsMap;

  const parsed = xmlParser.parse(xml);
  const rows = asArray(parsed?.worksheet?.sheetData?.row);

  rows.forEach((rowObj) => {
    const rowIndex = Number(rowObj?.r ?? 0);
    if (!rowIndex) return;

    const cells = asArray(rowObj?.c);
    const rowCells = new Map<number, string>();

    cells.forEach((cell) => {
      const ref = String(cell?.r ?? "");
      const loc = splitCellRef(ref);
      if (!loc) return;

      const t = String(cell?.t ?? "");
      let value = "";

      if (typeof cell?.f === "string") {
        value = `=${cell.f}`;
      } else if (t === "s") {
        const idx = Number(cell?.v ?? -1);
        value = idx >= 0 ? sharedStrings[idx] ?? "" : "";
      } else if (t === "inlineStr") {
        if (typeof cell?.is?.t === "string") {
          value = cell.is.t;
        } else {
          const runs = asArray(cell?.is?.r);
          value = runs.map((r) => String(r?.t ?? "")).join("");
        }
      } else {
        value = String(cell?.v ?? "");
      }

      if (value !== "") {
        rowCells.set(loc.col, value);
      }
    });

    if (rowCells.size > 0) {
      rowsMap.set(rowIndex, rowCells);
    }
  });

  return rowsMap;
}

function detectHeaderRow(rows: Map<number, Map<number, string>>): number {
  let bestRow = 1;
  let bestCount = -1;
  for (let r = 1; r <= 10; r += 1) {
    const count = rows.get(r)?.size ?? 0;
    if (count > bestCount) {
      bestCount = count;
      bestRow = r;
    }
  }
  return bestRow;
}

function toObjects(rows: Map<number, Map<number, string>>): AnyObject[] {
  if (rows.size === 0) return [];
  const headerRow = detectHeaderRow(rows);
  const headerCells = rows.get(headerRow);
  if (!headerCells) return [];

  const headers = new Map<number, string>();
  headerCells.forEach((v, k) => {
    headers.set(k, v.trim());
  });

  const out: AnyObject[] = [];
  const rowIndexes = [...rows.keys()].filter((r) => r > headerRow).sort((a, b) => a - b);

  rowIndexes.forEach((r) => {
    const cells = rows.get(r);
    if (!cells) return;

    const obj: AnyObject = {};
    headers.forEach((header, col) => {
      const raw = cells.get(col);
      if (raw !== undefined && raw !== "") {
        obj[header] = /^\d{5}$/.test(raw) ? excelSerialToDateText(raw) : raw;
      }
    });

    if (Object.keys(obj).length > 0) {
      out.push(obj);
    }
  });

  return out;
}

function findSheetByPrefix(sheets: SheetInfo[], prefix: string): SheetInfo | undefined {
  return sheets.find((s) => s.name.startsWith(prefix) && !s.name.includes("(2)"));
}

export function parseImportInput(input: unknown) {
  return importSchema.parse(input);
}

export function previewExcel(filePath: string): ImportPreview {
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.endsWith(".xlsx")) {
    throw new Error("仅支持 .xlsx 文件");
  }
  if (!fs.existsSync(resolvedPath)) {
    throw new Error("Excel 文件不存在");
  }

  const zip = new AdmZip(resolvedPath);
  const sharedStrings = getSharedStrings(zip);
  const sheets = getSheets(zip);

  const pickRows = (prefix: string) => {
    const sheet = findSheetByPrefix(sheets, prefix);
    if (!sheet) return [];
    const rows = readSheetRows(zip, sheet.target, sharedStrings);
    return toObjects(rows);
  };

  const projects = pickRows("01_项目立项卡").map((r) => ({
    projectName: r["项目名称"],
    projectType: r["项目类型"],
    year: Number(r["所属年度"] || 0),
    leadDepartment: r["牵头所室"],
    projectOwner: r["项目负责人"],
    participants: r["参与人员"],
    background: r["项目背景与必要性"],
    goal: r["项目目标"],
    scope: r["建设内容范围"],
    expectedOutcome: r["预期成果"]
  }));

  const wbs = pickRows("03_WBS任务分解").map((r) => ({
    level1Stage: r["一级阶段"],
    level2WorkPackage: r["二级工作包"],
    taskName: r["任务名称"],
    taskDetail: r["具体任务"],
    deliverable: r["交付物"],
    taskOwner: r["任务责任人"],
    plannedStartDate: r["计划开始时间"],
    plannedEndDate: r["计划完成时间"],
    currentStatus: r["当前状态"],
    isCritical: r["是否关键任务"],
    riskHint: r["风险点说明"],
    linkedMasterTask: r["关联总表任务"]
  }));

  const milestones = pickRows("04_里程碑计划").map((r) => ({
    milestoneCode: r["里程碑编号"],
    milestoneName: r["里程碑名称"],
    level1Stage: r["一级阶段"],
    relatedWorkPackage: r["对应工作包"],
    keyOutcome: r["关键成果"],
    doneCriteria: r["完成判定标准"],
    plannedFinishDate: r["计划完成时间"],
    actualFinishDate: r["实际完成时间"],
    owner: r["责任人"],
    currentStatus: r["当前状态"],
    note: r["备注"]
  }));

  const progressRecords = pickRows("06_推进记录").map((r) => ({
    statPeriod: r["统计周期"],
    currentStage: r["当前阶段"],
    milestoneCode: r["对应里程碑"],
    finishedWork: r["本期完成工作"],
    overallProgressPct: Number(r["当前整体进度(%)"] || 0),
    issuesAndRisks: r["存在问题与风险"],
    needsCoordination: r["需协调事项"],
    nextPlan: r["下阶段计划"],
    recorder: r["记录人"],
    recordDate: r["记录时间"]
  }));

  const statusAssessments = pickRows("08_项目状态评估").map((r) => ({
    evalPeriod: r["评估周期"],
    currentStage: r["当前阶段"],
    overallStatus: r["整体状态"],
    scheduleStatus: r["进度状态"],
    qualityStatus: r["质量状态"],
    riskStatus: r["风险状态"],
    assessmentBasis: r["状态判定依据"],
    watchItems: r["需关注事项"],
    assessor: r["评估人"],
    assessmentDate: r["评估时间"]
  }));

  const risks = pickRows("09_风险问题台账").map((r) => ({
    riskCode: r["问题/风险编号"],
    riskType: r["类型"],
    stage: r["所处阶段"],
    description: r["问题/风险描述"],
    impactLevel: r["影响范围/程度"],
    mitigationPlan: r["应对措施（处理方案）"] ?? r["应对措施"],
    owner: r["责任人"],
    plannedResolveDate: r["计划解决时间"],
    currentStatus: r["当前状态"],
    actualResolveDate: r["实际解决时间"],
    escalateToManagement: r["是否升级管理关注"],
    linkedMilestoneOrTask: r["关联里程碑 / WBS"],
    note: r["备注"]
  }));

  const changes = pickRows("10_变更申请").map((r) => ({
    changeCode: r["变更编号"],
    changeType: r["变更类型"],
    requestDate: r["变成提出日期"] ?? r["变更提出日期"],
    requester: r["变更提出人"],
    reason: r["变更原因"],
    beforeContent: r["变更前内容"],
    afterContent: r["变更后内容"],
    impactAnalysis: r["变更影响分析"],
    impactsMilestoneOrWbs: r["是否影响里程碑 / WBS"],
    evaluationConclusion: r["变更评估结论"],
    approver: r["批准人"],
    approvalDate: r["批准日期"],
    currentStatus: r["当前状态"],
    note: r["备注"]
  }));

  const cleanProjects = projects.filter(
    (r) => !!r.projectName && !!r.projectType && !!r.leadDepartment && !!r.projectOwner && Number(r.year) >= 2000
  );
  const cleanWbs = wbs.filter(
    (r) =>
      stageSet.has(r.level1Stage || "") &&
      !!r.taskName &&
      !String(r.taskName).includes("/") &&
      !!r.taskOwner &&
      /^\d{4}-\d{2}-\d{2}/.test(r.plannedStartDate || "") &&
      /^\d{4}-\d{2}-\d{2}/.test(r.plannedEndDate || "")
  );
  const cleanMilestones = milestones.filter(
    (r) => /^M\d+/i.test(r.milestoneCode || "") && stageSet.has(r.level1Stage || "") && !!r.milestoneName
  );
  const cleanProgressRecords = progressRecords.filter(
    (r) => stageSet.has(r.currentStage || "") && !!r.recorder && /^\d{4}-\d{2}-\d{2}/.test(r.recordDate || "")
  );
  const cleanStatusAssessments = statusAssessments.filter(
    (r) => trafficSet.has(r.overallStatus || "") && !!r.assessor && /^\d{4}-\d{2}-\d{2}/.test(r.assessmentDate || "")
  );
  const cleanRisks = risks.filter((r) => !!r.riskCode && !!r.description && stageSet.has(r.stage || ""));
  const cleanChanges = changes.filter((r) => !!r.changeCode && !!r.changeType && !!r.requester);

  return {
    summary: {
      sheets: sheets.map((s) => s.name),
      projects: cleanProjects.length,
      wbs: cleanWbs.length,
      milestones: cleanMilestones.length,
      progressRecords: cleanProgressRecords.length,
      statusAssessments: cleanStatusAssessments.length,
      risks: cleanRisks.length,
      changes: cleanChanges.length
    },
    data: {
      projects: cleanProjects,
      wbs: cleanWbs,
      milestones: cleanMilestones,
      progressRecords: cleanProgressRecords,
      statusAssessments: cleanStatusAssessments,
      risks: cleanRisks,
      changes: cleanChanges
    }
  };
}
