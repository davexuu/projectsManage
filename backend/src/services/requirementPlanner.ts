import type {
  RequirementTodoItem,
  Stage,
  WbsPlanningItemType,
  WbsQuickIntent,
  WbsQuickSuggestionResult,
  WbsSuggestionMode,
  WbsTask
} from "../domain/types.js";

const INTENT_KEYWORDS: Array<{ intent: WbsQuickIntent; keywords: string[]; reason: string }> = [
  { intent: "新增", keywords: ["新增", "新建", "开发", "上线", "建设", "实现"], reason: "命中功能建设关键词" },
  { intent: "修复", keywords: ["修复", "排查", "故障", "问题", "缺陷", "bug"], reason: "命中缺陷治理关键词" },
  { intent: "优化", keywords: ["优化", "重构", "提效", "性能", "改造"], reason: "命中优化改造关键词" },
  { intent: "合规", keywords: ["合规", "审计", "制度", "规范", "监管"], reason: "命中合规治理关键词" }
];

const ITEM_TYPE_INTENT_MAP: Record<WbsPlanningItemType, WbsQuickIntent> = {
  功能开发: "新增",
  数据处理: "优化",
  材料编写: "优化",
  会议协调: "优化",
  排查修复: "修复",
  其他事项: "新增"
};

const DATA_KEYWORDS = ["建表", "表", "字段", "数据结构", "数据库", "日志", "索引", "schema"];
const BACKEND_KEYWORDS = ["接口", "后端", "服务", "逻辑", "权限", "校验", "定时", "导出", "导入", "api"];
const FRONTEND_KEYWORDS = ["页面", "前端", "按钮", "弹窗", "列表", "表单", "交互", "展示", "入口", "原型", "ui"];

type TodoSeed = {
  workPackage: string;
  stage: Stage;
  titleTemplate: string;
  detailTemplate: string;
  deliverableTemplate: string;
  isCritical?: boolean;
};

type PlannedTodo = {
  todo: RequirementTodoItem;
  isCritical?: boolean;
};

const ITEM_TYPE_TEMPLATES: Record<WbsPlanningItemType, TodoSeed[]> = {
  功能开发: [
    {
      workPackage: "需求确认",
      stage: "规划",
      titleTemplate: "确认{{topic}}范围与完成口径",
      detailTemplate: "与需求提出方确认{{topic}}的范围、边界、优先级和完成口径",
      deliverableTemplate: "{{topic}}确认记录",
      isCritical: true
    },
    {
      workPackage: "方案设计",
      stage: "规划",
      titleTemplate: "梳理{{topic}}实现方案",
      detailTemplate: "结合现有系统结构明确{{topic}}的实现思路、影响范围和改动路径",
      deliverableTemplate: "{{topic}}方案说明"
    },
    {
      workPackage: "验证上线",
      stage: "验收",
      titleTemplate: "验证{{topic}}并上线确认",
      detailTemplate: "完成{{topic}}相关功能自测、上线检查，并记录上线后需要关注的反馈项",
      deliverableTemplate: "{{topic}}验证记录"
    }
  ],
  数据处理: [
    {
      workPackage: "口径确认",
      stage: "规划",
      titleTemplate: "确认{{topic}}口径与输出要求",
      detailTemplate: "确认{{topic}}涉及的数据范围、统计口径、输出格式和截止要求",
      deliverableTemplate: "{{topic}}口径确认记录",
      isCritical: true
    },
    {
      workPackage: "数据收集",
      stage: "执行",
      titleTemplate: "收集{{topic}}所需数据",
      detailTemplate: "汇总{{topic}}涉及的数据来源、原始材料和缺口项，确保输入完整",
      deliverableTemplate: "{{topic}}原始数据清单"
    },
    {
      workPackage: "数据整理",
      stage: "执行",
      titleTemplate: "整理{{topic}}数据内容",
      detailTemplate: "按确认口径清洗、汇总和整理{{topic}}数据，形成可复用结果",
      deliverableTemplate: "{{topic}}整理结果"
    },
    {
      workPackage: "结果复核",
      stage: "验收",
      titleTemplate: "复核{{topic}}结果",
      detailTemplate: "检查{{topic}}结果的一致性、完整性和关键差异，确认可提交",
      deliverableTemplate: "{{topic}}复核记录"
    }
  ],
  材料编写: [
    {
      workPackage: "提纲确认",
      stage: "规划",
      titleTemplate: "确认{{topic}}提纲与交付要求",
      detailTemplate: "明确{{topic}}的目标对象、章节结构、关键素材和提交流程",
      deliverableTemplate: "{{topic}}提纲确认记录",
      isCritical: true
    },
    {
      workPackage: "素材收集",
      stage: "执行",
      titleTemplate: "收集{{topic}}编写素材",
      detailTemplate: "整理{{topic}}需要引用的数据、截图、附件和历史资料",
      deliverableTemplate: "{{topic}}素材清单"
    },
    {
      workPackage: "初稿编写",
      stage: "执行",
      titleTemplate: "完成{{topic}}初稿编写",
      detailTemplate: "按既定提纲完成{{topic}}初稿，并标出待确认内容",
      deliverableTemplate: "{{topic}}初稿"
    },
    {
      workPackage: "修改定稿",
      stage: "验收",
      titleTemplate: "完成{{topic}}修改定稿",
      detailTemplate: "结合反馈修订{{topic}}内容，形成可提交的正式版本",
      deliverableTemplate: "{{topic}}定稿"
    }
  ],
  会议协调: [
    {
      workPackage: "议题确认",
      stage: "规划",
      titleTemplate: "确认{{topic}}议题与参会范围",
      detailTemplate: "明确{{topic}}的会议目标、参会人员、待决策事项和输出要求",
      deliverableTemplate: "{{topic}}会议准备清单",
      isCritical: true
    },
    {
      workPackage: "会前准备",
      stage: "执行",
      titleTemplate: "准备{{topic}}会议材料",
      detailTemplate: "收集{{topic}}所需材料、问题清单和对齐事项，完成会前准备",
      deliverableTemplate: "{{topic}}会议材料"
    },
    {
      workPackage: "会议执行",
      stage: "执行",
      titleTemplate: "组织{{topic}}会议沟通",
      detailTemplate: "组织参会方围绕{{topic}}开展对齐、确认和决策沟通",
      deliverableTemplate: "{{topic}}会议纪要"
    },
    {
      workPackage: "事项跟进",
      stage: "验收",
      titleTemplate: "跟进{{topic}}会议结论",
      detailTemplate: "跟踪{{topic}}会议结论的责任分工、完成情况和后续动作",
      deliverableTemplate: "{{topic}}跟进记录"
    }
  ],
  排查修复: [
    {
      workPackage: "问题确认",
      stage: "规划",
      titleTemplate: "确认{{topic}}问题范围与影响面",
      detailTemplate: "确认{{topic}}的问题现象、影响范围、优先级和触发条件",
      deliverableTemplate: "{{topic}}问题确认记录",
      isCritical: true
    },
    {
      workPackage: "问题排查",
      stage: "执行",
      titleTemplate: "排查{{topic}}问题根因",
      detailTemplate: "分析{{topic}}问题日志、数据和触发链路，定位根因",
      deliverableTemplate: "{{topic}}排查记录"
    },
    {
      workPackage: "修复处理",
      stage: "执行",
      titleTemplate: "完成{{topic}}修复处理",
      detailTemplate: "按排查结果完成{{topic}}修复或替代处理，并完成自查",
      deliverableTemplate: "{{topic}}修复记录"
    },
    {
      workPackage: "验证确认",
      stage: "验收",
      titleTemplate: "验证{{topic}}修复结果",
      detailTemplate: "确认{{topic}}问题已解除且未引入新的明显异常",
      deliverableTemplate: "{{topic}}验证记录"
    }
  ],
  其他事项: [
    {
      workPackage: "事项确认",
      stage: "规划",
      titleTemplate: "确认{{topic}}目标与完成口径",
      detailTemplate: "明确{{topic}}的目标、边界、责任人协同和完成口径",
      deliverableTemplate: "{{topic}}确认记录",
      isCritical: true
    },
    {
      workPackage: "执行处理",
      stage: "执行",
      titleTemplate: "推进{{topic}}执行处理",
      detailTemplate: "围绕{{topic}}组织具体执行动作，并同步进展和阻塞项",
      deliverableTemplate: "{{topic}}执行记录"
    },
    {
      workPackage: "结果确认",
      stage: "验收",
      titleTemplate: "确认{{topic}}处理结果",
      detailTemplate: "检查{{topic}}执行结果是否满足预期，并记录后续待办",
      deliverableTemplate: "{{topic}}结果确认记录"
    }
  ]
};

interface PlannerInput {
  projectId: string;
  itemType: WbsPlanningItemType;
  prompt: string;
  plannedStartDate: string;
  plannedEndDate: string;
  projectOwner?: string;
  mode?: WbsSuggestionMode;
}

function normalizePrompt(prompt: string) {
  return prompt.trim().replace(/[；;。]+/g, "，").replace(/\s+/g, " ");
}

function ensureSentence(value: string) {
  const text = value.trim();
  if (!text) return "";
  return /[。；;]$/.test(text) ? text : `${text}。`;
}

function formatText(template: string, topic: string) {
  return template.replace(/\{\{topic\}\}/g, topic);
}

function hasAnyKeyword(prompt: string, keywords: string[]) {
  return keywords.some((keyword) => prompt.includes(keyword.toLowerCase()));
}

function sliceByMode<T>(items: T[], mode: WbsSuggestionMode) {
  if (mode === "light") return items.slice(0, 3);
  if (mode === "standard") return items.slice(0, 5);
  return items;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function offsetDate(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function allocateDateRange(startText: string, endText: string, index: number, total: number) {
  const start = new Date(startText);
  const end = new Date(endText);
  const inclusiveDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1);
  if (total <= 1 || inclusiveDays <= 1) {
    return {
      plannedStartDate: formatDate(start),
      plannedEndDate: formatDate(end)
    };
  }
  const startOffset = Math.floor((index * inclusiveDays) / total);
  const nextOffset = Math.floor(((index + 1) * inclusiveDays) / total);
  const endOffset = Math.max(startOffset, nextOffset - 1);
  return {
    plannedStartDate: formatDate(offsetDate(start, startOffset)),
    plannedEndDate: formatDate(offsetDate(start, Math.min(endOffset, inclusiveDays - 1)))
  };
}

function buildReason(itemType: WbsPlanningItemType, mode: WbsSuggestionMode, intentReason: string, todos: RequirementTodoItem[]) {
  const modeText =
    mode === "light"
      ? "轻量档（保留最小可执行骨架）"
      : mode === "complete"
        ? "完整档（尽量覆盖全链路）"
        : "标准档（覆盖常见工作路径）";
  const packageText = todos.map((item) => item.workPackage).join("、");
  return `${modeText}；事项类型：${itemType}；${intentReason}；本次覆盖：${packageText}`;
}

function resolveIntent(prompt: string, itemType: WbsPlanningItemType): { intent: WbsQuickIntent; reason: string } {
  const normalized = prompt.toLowerCase();
  for (const item of INTENT_KEYWORDS) {
    if (item.keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) {
      return { intent: item.intent, reason: item.reason };
    }
  }
  return { intent: ITEM_TYPE_INTENT_MAP[itemType], reason: `未命中明确关键词，使用${itemType}规则模板` };
}

function buildSummary(itemType: WbsPlanningItemType, prompt: string) {
  return `已按“${itemType}”类型为“${prompt}”生成轻量任务草稿`;
}

function toTodo(seed: TodoSeed, prompt: string): RequirementTodoItem {
  return {
    title: formatText(seed.titleTemplate, prompt),
    workPackage: seed.workPackage,
    stage: seed.stage,
    detail: ensureSentence(formatText(seed.detailTemplate, prompt)),
    deliverable: formatText(seed.deliverableTemplate, prompt)
  };
}

function buildFunctionalConditionalTodos(prompt: string, normalizedPrompt: string): PlannedTodo[] {
  const items: PlannedTodo[] = [];
  if (hasAnyKeyword(normalizedPrompt, DATA_KEYWORDS)) {
    items.push({
      todo: {
        title: `调整${prompt}相关数据结构`,
        workPackage: "数据结构",
        stage: "执行",
        detail: ensureSentence(`梳理${prompt}涉及的表、字段、日志或存储结构，完成必要的数据结构调整`),
        deliverable: `${prompt}数据结构调整记录`
      }
    });
  }
  if (hasAnyKeyword(normalizedPrompt, BACKEND_KEYWORDS) || !hasAnyKeyword(normalizedPrompt, FRONTEND_KEYWORDS)) {
    items.push({
      todo: {
        title: `完成${prompt}后端实现`,
        workPackage: "后端实现",
        stage: "执行",
        detail: ensureSentence(`完成${prompt}相关接口、服务逻辑、权限或校验能力的开发与自测`),
        deliverable: `${prompt}后端实现记录`
      },
      isCritical: true
    });
  }
  if (hasAnyKeyword(normalizedPrompt, FRONTEND_KEYWORDS) || !hasAnyKeyword(normalizedPrompt, BACKEND_KEYWORDS)) {
    items.push({
      todo: {
        title: `完成${prompt}前端实现`,
        workPackage: "前端实现",
        stage: "执行",
        detail: ensureSentence(`完成${prompt}相关页面入口、交互、展示或表单改造，并确保主流程可操作`),
        deliverable: `${prompt}前端实现记录`
      }
    });
  }
  return items;
}

function buildTodos(itemType: WbsPlanningItemType, prompt: string, normalizedPrompt: string, mode: WbsSuggestionMode) {
  const seeds = ITEM_TYPE_TEMPLATES[itemType] ?? ITEM_TYPE_TEMPLATES["其他事项"];
  const base: PlannedTodo[] = seeds.map((seed) => ({
    todo: toTodo(seed, prompt),
    isCritical: seed.isCritical
  }));
  const conditional: PlannedTodo[] = itemType === "功能开发" ? buildFunctionalConditionalTodos(prompt, normalizedPrompt.toLowerCase()) : [];
  const merged: PlannedTodo[] = [...base];
  conditional.forEach((item) => {
    if (!merged.some((current) => current.todo.workPackage === item.todo.workPackage)) {
      const insertIndex = merged.findIndex((current) => current.todo.workPackage === "验证上线");
      if (insertIndex >= 0) {
        merged.splice(insertIndex, 0, item);
      } else {
        merged.push(item);
      }
    }
  });
  return sliceByMode(merged, mode);
}

function mapTodoToDraft(
  item: PlannedTodo,
  projectId: string,
  owner: string,
  plannedStartDate: string,
  plannedEndDate: string
): Omit<WbsTask, "id" | "createdAt" | "updatedAt"> {
  return {
    projectId,
    level1Stage: item.todo.stage,
    level2WorkPackage: item.todo.workPackage,
    taskName: item.todo.title,
    taskDetail: item.todo.detail,
    deliverable: item.todo.deliverable,
    taskOwner: owner,
    plannedStartDate,
    plannedEndDate,
    currentStatus: "未开始",
    isCritical: item.isCritical ? "是" : "否",
    predecessorTaskIds: []
  };
}

export function planRequirementToLightWbs(input: PlannerInput): WbsQuickSuggestionResult {
  const normalizedPrompt = normalizePrompt(input.prompt);
  const mode = input.mode ?? "standard";
  const owner = (input.projectOwner || "").trim() || "待分配";
  const { intent, reason: intentReason } = resolveIntent(normalizedPrompt, input.itemType);
  const plannedTodos = buildTodos(input.itemType, normalizedPrompt, normalizedPrompt, mode);
  const todos = plannedTodos.map((item) => item.todo);
  const wbsDrafts = plannedTodos.map((item, index) => {
    const range = allocateDateRange(input.plannedStartDate, input.plannedEndDate, index, plannedTodos.length);
    return mapTodoToDraft(item, input.projectId, owner, range.plannedStartDate, range.plannedEndDate);
  });

  return {
    itemType: input.itemType,
    intent,
    mode,
    normalizedPrompt,
    requirementSummary: buildSummary(input.itemType, normalizedPrompt),
    todos,
    reason: buildReason(input.itemType, mode, intentReason, todos),
    wbsDrafts,
    items: wbsDrafts
  };
}
