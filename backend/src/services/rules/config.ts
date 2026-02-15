import { TaskStatus } from "../../domain/types.js";

export const RULE_CONFIG = {
  codePatterns: {
    milestone: /^M\d+$/i,
    risk: /^(P|R)-\d+$/i,
    change: /^C-\d+$/i
  },
  allowedChangeTypes: ["目标变更", "范围变更", "进度变更", "成果变更", "资源变更"],
  vaguePhrases: ["进展顺利", "整体可控", "情况良好", "持续推进相关工作", "项目推进有困难", "情况比较复杂"],
  trafficRank: {
    绿: 1,
    黄: 2,
    红: 3
  },
  changeStatusFlow: {
    未开始: ["未开始", "进行中", "延期"],
    进行中: ["进行中", "已完成", "延期"],
    延期: ["延期", "进行中"],
    已完成: ["已完成"]
  } as Record<TaskStatus, TaskStatus[]>
} as const;

