import { spawn } from "node:child_process";
import process from "node:process";

const BASE_URL = process.env.API_BASE_URL || "http://localhost:4000";
const API = `${BASE_URL}/api`;
const ADMIN_PASSWORD = process.env.REGRESSION_ADMIN_PASSWORD || "Admin@123";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path, options = {}) {
  const mergedHeaders = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: mergedHeaders
  });
  let body = null;
  const text = await res.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { raw: text };
    }
  }
  return { status: res.status, body };
}

async function waitForHealth(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return true;
    } catch {}
    await sleep(500);
  }
  return false;
}

function assertStatus(actual, expected, label, body = null) {
  if (actual !== expected) {
    const detail = body ? `，响应: ${JSON.stringify(body)}` : "";
    throw new Error(`[${label}] 期望状态码 ${expected}，实际 ${actual}${detail}`);
  }
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

async function login(username, password) {
  const r = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password })
  });
  assertStatus(r.status, 200, `登录 ${username}`, r.body);
  if (!r.body?.token) throw new Error(`登录 ${username} 未返回 token`);
  return r.body;
}

async function main() {
  let backendProc = null;
  let startedByScript = false;

  const alive = await waitForHealth(1500);
  if (!alive) {
    backendProc = spawn("node", ["dist/server.js"], {
      cwd: new URL("../", import.meta.url).pathname,
      stdio: "inherit",
      env: process.env
    });
    startedByScript = true;
    const ok = await waitForHealth();
    if (!ok) throw new Error("后端启动超时，无法执行回归测试");
  }

  try {
    const admin = await login("admin", ADMIN_PASSWORD);
    const adminToken = admin.token;

    const usersResp = await request("/users", { headers: authHeader(adminToken) });
    assertStatus(usersResp.status, 200, "查询用户列表", usersResp.body);
    const users = usersResp.body || [];
    const pm = users.find((u) => u.username === "pm");
    const member = users.find((u) => u.username === "member");
    if (!pm || !member) throw new Error("未找到 pm/member 用户，无法继续回归");

    const stamp = Date.now();
    const projectName = `回归测试项目-${stamp}`;
    const createProjectResp = await request("/projects", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectName,
        projectType: "A 类科研",
        year: 2026,
        leadDepartment: "经营管理信息化研究所",
        projectOwner: "系统管理员",
        participants: "项目经理,项目成员",
        background: "回归测试",
        goal: "验证P0规则",
        scope: "接口回归",
        expectedOutcome: "规则可用"
      })
    });
    assertStatus(createProjectResp.status, 201, "创建项目", createProjectResp.body);
    const projectId = createProjectResp.body?.id;
    if (!projectId) throw new Error("创建项目未返回 projectId");

    const grantMemberResp = await request(`/projects/${projectId}/members`, {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({ userId: member.id, accessRole: "EDITOR" })
    });
    assertStatus(grantMemberResp.status, 201, "授权成员 EDITOR", grantMemberResp.body);

    const createWbsResp = await request("/wbs", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        level1Stage: "规划",
        level2WorkPackage: "功能梳理与整合",
        taskName: "梳理功能模块",
        taskDetail: "梳理现有功能和入口",
        deliverable: "功能清单",
        taskOwner: "系统管理员",
        plannedStartDate: "2026-02-01",
        plannedEndDate: "2026-02-10",
        currentStatus: "进行中",
        isCritical: "是",
        riskHint: "跨部门协同",
        linkedMasterTask: "总表-001"
      })
    });
    assertStatus(createWbsResp.status, 201, "创建WBS", createWbsResp.body);
    const firstWbsId = createWbsResp.body?.id;
    if (!firstWbsId) throw new Error("创建WBS未返回id");
    if (!/^\d+(?:\.\d+)*$/.test(String(createWbsResp.body?.wbsCode ?? ""))) {
      throw new Error("创建WBS未自动生成合法编码");
    }

    const suggestionResp = await request("/wbs/quick-suggestions", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        prompt: "新增支付功能"
      })
    });
    assertStatus(suggestionResp.status, 200, "规则拆解建议接口", suggestionResp.body);
    if (!Array.isArray(suggestionResp.body?.items) || suggestionResp.body.items.length === 0) {
      throw new Error("规则拆解建议未返回任务列表");
    }

    const validatePlanResp = await request("/wbs/validate-plan", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        items: [
          {
            projectId,
            wbsCode: "1.2",
            level1Stage: "规划",
            level2WorkPackage: "集成联调",
            taskName: "接口联调任务",
            taskDetail: "按规范完成联调",
            deliverable: "联调记录",
            taskOwner: "系统管理员",
            plannedStartDate: "2026-02-05",
            plannedEndDate: "2026-02-11",
            currentStatus: "未开始",
            isCritical: "否",
            predecessorTaskIds: [firstWbsId]
          }
        ]
      })
    });
    assertStatus(validatePlanResp.status, 200, "计划校验接口可用", validatePlanResp.body);
    if (validatePlanResp.body?.ok !== false) {
      throw new Error("计划校验应识别依赖时间冲突");
    }

    const batchBadResp = await request("/wbs/batch", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        items: [
          {
            projectId,
            wbsCode: "1.3",
            level1Stage: "规划",
            level2WorkPackage: "集成联调",
            taskName: "批量任务-非法日期",
            taskDetail: "测试批量校验",
            deliverable: "记录",
            taskOwner: "系统管理员",
            plannedStartDate: "2026-03-10",
            plannedEndDate: "2026-03-01",
            currentStatus: "未开始",
            isCritical: "否"
          }
        ]
      })
    });
    assertStatus(batchBadResp.status, 400, "批量创建行级校验", batchBadResp.body);
    if (!Array.isArray(batchBadResp.body?.details?.rowErrors)) {
      throw new Error("批量创建错误未返回 rowErrors 明细");
    }

    const batchCreateResp = await request("/wbs/batch", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        items: [
          {
            projectId,
            level1Stage: "规划",
            level2WorkPackage: "集成联调",
            taskName: "批量任务-01",
            taskDetail: "测试批量提交",
            deliverable: "记录",
            taskOwner: "系统管理员",
            plannedStartDate: "2026-03-01",
            plannedEndDate: "2026-03-05",
            currentStatus: "未开始",
            isCritical: "否",
            predecessorTaskIds: [firstWbsId]
          },
          {
            projectId,
            level1Stage: "规划",
            level2WorkPackage: "集成联调",
            taskName: "批量任务-02",
            taskDetail: "测试批量提交",
            deliverable: "记录",
            taskOwner: "系统管理员",
            plannedStartDate: "2026-03-06",
            plannedEndDate: "2026-03-12",
            currentStatus: "未开始",
            isCritical: "否"
          }
        ]
      })
    });
    assertStatus(batchCreateResp.status, 201, "批量创建WBS", batchCreateResp.body);
    if (Number(batchCreateResp.body?.createdCount) !== 2) {
      throw new Error("批量创建返回数量不符合预期");
    }
    const autoCodes = (batchCreateResp.body?.items || []).map((item) => String(item.wbsCode || ""));
    if (autoCodes.some((code) => !/^\d+(?:\.\d+)*$/.test(code))) {
      throw new Error("批量创建未自动生成合法WBS编码");
    }

    const badMilestoneCodeResp = await request("/milestones", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        milestoneCode: "X1",
        milestoneName: "里程碑错误编码",
        level1Stage: "规划",
        relatedWorkPackage: "功能梳理与整合",
        keyOutcome: "输出方案",
        doneCriteria: "方案确认",
        plannedFinishDate: "2026-03-01",
        owner: "系统管理员",
        currentStatus: "未开始"
      })
    });
    assertStatus(badMilestoneCodeResp.status, 400, "里程碑编码格式校验", badMilestoneCodeResp.body);

    const createMilestoneResp = await request("/milestones", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        milestoneCode: "M1",
        milestoneName: "形成整合方案",
        level1Stage: "规划",
        relatedWorkPackage: "功能梳理与整合",
        keyOutcome: "形成方案",
        doneCriteria: "通过评审",
        plannedFinishDate: "2026-03-01",
        owner: "系统管理员",
        currentStatus: "进行中"
      })
    });
    assertStatus(createMilestoneResp.status, 201, "创建里程碑", createMilestoneResp.body);
    const milestoneId = createMilestoneResp.body?.id;
    if (!milestoneId) throw new Error("创建里程碑未返回id");

    const linkWbsResp = await request(`/wbs/${firstWbsId}`, {
      method: "PUT",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        wbsCode: "1.1",
        milestoneId,
        level1Stage: "规划",
        level2WorkPackage: "功能梳理与整合",
        taskName: "梳理功能模块",
        taskDetail: "梳理现有功能和入口",
        deliverable: "功能清单",
        taskOwner: "系统管理员",
        plannedStartDate: "2026-02-01",
        plannedEndDate: "2026-02-10",
        currentStatus: "进行中",
        isCritical: "是",
        riskHint: "跨部门协同",
        linkedMasterTask: "总表-001"
      })
    });
    assertStatus(linkWbsResp.status, 200, "关联任务到里程碑", linkWbsResp.body);

    const milestoneSummaryResp = await request(`/milestones?projectId=${projectId}&includeTaskSummary=true`, {
      headers: authHeader(adminToken)
    });
    assertStatus(milestoneSummaryResp.status, 200, "里程碑关联摘要查询", milestoneSummaryResp.body);
    const linkedMilestone = (milestoneSummaryResp.body || []).find((item) => item.id === milestoneId);
    if (!linkedMilestone || !Array.isArray(linkedMilestone.linkedTaskSummaries)) {
      throw new Error("里程碑摘要未返回 linkedTaskSummaries");
    }

    const progressMissingMilestoneResp = await request("/progress-records", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        statPeriod: "2026-02-15",
        currentStage: "规划",
        milestoneCode: "M999",
        finishedWork: "完成梳理",
        overallProgressPct: 30,
        issuesAndRisks: "无",
        needsCoordination: "无",
        nextPlan: "继续推进",
        recorder: "系统管理员",
        recordDate: "2026-02-15"
      })
    });
    assertStatus(progressMissingMilestoneResp.status, 400, "推进记录里程碑关联校验", progressMissingMilestoneResp.body);

    const progressStageMismatchResp = await request("/progress-records", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        statPeriod: "2026-02-15",
        currentStage: "执行",
        milestoneCode: "M1",
        finishedWork: "完成梳理",
        overallProgressPct: 35,
        issuesAndRisks: "无",
        needsCoordination: "无",
        nextPlan: "继续推进",
        recorder: "系统管理员",
        recordDate: "2026-02-15"
      })
    });
    assertStatus(progressStageMismatchResp.status, 400, "推进阶段与里程碑一致性", progressStageMismatchResp.body);

    const badRiskCodeResp = await request("/risks", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        riskCode: "RISK1",
        riskType: "协同风险",
        stage: "规划",
        description: "跨部门确认慢",
        impactLevel: "高",
        mitigationPlan: "专项沟通",
        owner: "系统管理员",
        plannedResolveDate: "2026-03-05",
        currentStatus: "进行中",
        escalateToManagement: "是"
      })
    });
    assertStatus(badRiskCodeResp.status, 400, "风险编号格式校验", badRiskCodeResp.body);

    const riskBadLinkResp = await request("/risks", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        riskCode: "R-99",
        riskType: "协同风险",
        stage: "规划",
        description: "跨部门确认慢",
        impactLevel: "高",
        mitigationPlan: "专项沟通",
        owner: "系统管理员",
        plannedResolveDate: "2026-03-05",
        currentStatus: "进行中",
        escalateToManagement: "否",
        linkedMilestoneOrTask: "不存在的任务"
      })
    });
    assertStatus(riskBadLinkResp.status, 400, "风险关联对象存在性校验", riskBadLinkResp.body);

    const createRiskResp = await request("/risks", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        riskCode: "R-01",
        riskType: "协同风险",
        stage: "规划",
        description: "跨部门确认慢",
        impactLevel: "高",
        mitigationPlan: "专项沟通",
        owner: "系统管理员",
        plannedResolveDate: "2026-03-05",
        currentStatus: "进行中",
        escalateToManagement: "是"
      })
    });
    assertStatus(createRiskResp.status, 201, "创建升级风险", createRiskResp.body);

    const badAssessmentResp = await request("/status-assessments", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        evalPeriod: "2026-02-15",
        currentStage: "规划",
        overallStatus: "绿",
        scheduleStatus: "绿",
        qualityStatus: "绿",
        riskStatus: "绿",
        assessmentBasis: "测试",
        watchItems: "无",
        assessor: "系统管理员",
        assessmentDate: "2026-02-15"
      })
    });
    assertStatus(badAssessmentResp.status, 400, "升级风险联动校验", badAssessmentResp.body);

    const createAssessmentResp = await request("/status-assessments", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        evalPeriod: "2026-02-15",
        currentStage: "规划",
        overallStatus: "黄",
        scheduleStatus: "绿",
        qualityStatus: "绿",
        riskStatus: "黄",
        assessmentBasis: "存在升级风险",
        watchItems: "需跟进",
        assessor: "系统管理员",
        assessmentDate: "2026-02-15"
      })
    });
    assertStatus(createAssessmentResp.status, 201, "创建状态评估", createAssessmentResp.body);

    const vagueAssessmentBasisResp = await request("/status-assessments", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        evalPeriod: "2026-02-16",
        currentStage: "规划",
        overallStatus: "黄",
        scheduleStatus: "黄",
        qualityStatus: "黄",
        riskStatus: "黄",
        assessmentBasis: "整体可控",
        watchItems: "无",
        assessor: "系统管理员",
        assessmentDate: "2026-02-16"
      })
    });
    assertStatus(vagueAssessmentBasisResp.status, 400, "状态评估空泛文案校验", vagueAssessmentBasisResp.body);

    const stageInconsistentAssessmentResp = await request("/status-assessments", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        evalPeriod: "2026-02-17",
        currentStage: "验收",
        overallStatus: "黄",
        scheduleStatus: "黄",
        qualityStatus: "黄",
        riskStatus: "黄",
        assessmentBasis: "存在阶段性风险",
        watchItems: "无",
        assessor: "系统管理员",
        assessmentDate: "2026-02-17"
      })
    });
    assertStatus(stageInconsistentAssessmentResp.status, 400, "状态评估阶段一致性校验", stageInconsistentAssessmentResp.body);

    const dupAssessmentResp = await request("/status-assessments", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        evalPeriod: "2026-02-15",
        currentStage: "规划",
        overallStatus: "黄",
        scheduleStatus: "黄",
        qualityStatus: "黄",
        riskStatus: "黄",
        assessmentBasis: "重复周期",
        watchItems: "无",
        assessor: "系统管理员",
        assessmentDate: "2026-02-15"
      })
    });
    assertStatus(dupAssessmentResp.status, 409, "状态评估周期唯一", dupAssessmentResp.body);

    const createPendingChangeResp = await request("/changes", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        changeCode: "C-01",
        changeType: "范围变更",
        requestDate: "2026-02-16",
        requester: "系统管理员",
        reason: "范围调整",
        beforeContent: "原范围",
        afterContent: "新范围",
        impactAnalysis: "影响里程碑",
        impactsMilestoneOrWbs: "是",
        evaluationConclusion: "待审批",
        currentStatus: "未开始"
      })
    });
    assertStatus(createPendingChangeResp.status, 201, "创建未审批变更", createPendingChangeResp.body);

    const badChangeTypeResp = await request("/changes", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        changeCode: "C-02",
        changeType: "其他",
        requestDate: "2026-02-16",
        requester: "系统管理员",
        reason: "范围调整",
        beforeContent: "原范围",
        afterContent: "新范围",
        impactAnalysis: "影响里程碑",
        impactsMilestoneOrWbs: "否",
        evaluationConclusion: "待审批",
        currentStatus: "未开始"
      })
    });
    assertStatus(badChangeTypeResp.status, 400, "变更类型校验", badChangeTypeResp.body);

    const vagueChangeReasonResp = await request("/changes", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        changeCode: "C-04",
        changeType: "范围变更",
        requestDate: "2026-02-20",
        requester: "系统管理员",
        reason: "情况比较复杂",
        beforeContent: "原范围",
        afterContent: "新范围",
        impactAnalysis: "影响里程碑",
        impactsMilestoneOrWbs: "否",
        evaluationConclusion: "待审批",
        currentStatus: "未开始"
      })
    });
    assertStatus(vagueChangeReasonResp.status, 400, "变更空泛原因校验", vagueChangeReasonResp.body);

    const createFlowChangeResp = await request("/changes", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        changeCode: "C-03",
        changeType: "进度变更",
        requestDate: "2026-02-18",
        requester: "系统管理员",
        reason: "需重新排期",
        beforeContent: "原计划A",
        afterContent: "新计划B",
        impactAnalysis: "影响进度",
        impactsMilestoneOrWbs: "否",
        evaluationConclusion: "提交审批",
        currentStatus: "未开始"
      })
    });
    assertStatus(createFlowChangeResp.status, 201, "创建流转测试变更", createFlowChangeResp.body);

    const illegalFlowResp = await request(`/changes/${createFlowChangeResp.body.id}`, {
      method: "PUT",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        changeCode: "C-03",
        changeType: "进度变更",
        requestDate: "2026-02-18",
        requester: "系统管理员",
        reason: "需重新排期",
        beforeContent: "原计划A",
        afterContent: "新计划B",
        impactAnalysis: "影响进度",
        impactsMilestoneOrWbs: "否",
        evaluationConclusion: "直接实施",
        approver: "系统管理员",
        approvalDate: "2026-02-19",
        currentStatus: "已完成"
      })
    });
    assertStatus(illegalFlowResp.status, 400, "变更状态流转校验", illegalFlowResp.body);

    const blockedWbsResp = await request("/wbs", {
      method: "POST",
      headers: authHeader(adminToken),
      body: JSON.stringify({
        projectId,
        level1Stage: "执行",
        level2WorkPackage: "实施优化",
        taskName: "优化页面结构",
        taskDetail: "进行页面重构",
        deliverable: "优化页面",
        taskOwner: "系统管理员",
        plannedStartDate: "2026-02-20",
        plannedEndDate: "2026-03-01",
        currentStatus: "未开始",
        isCritical: "否"
      })
    });
    assertStatus(blockedWbsResp.status, 409, "未审批变更阻断WBS基线修改", blockedWbsResp.body);

    console.log("API 回归通过：关键 P0/P1 规则校验全部符合预期。");
  } finally {
    if (startedByScript && backendProc) {
      backendProc.kill("SIGTERM");
    }
  }
}

main().catch((err) => {
  console.error("API 回归失败:", err.message);
  process.exit(1);
});
