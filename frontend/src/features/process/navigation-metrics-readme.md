# 过程导航效率指标输出格式

## 1. 报告对象结构

`getNavigationMetricsReport()` 输出：

- `generatedAt`: 报告生成时间
- `totalClicks`: 会话累计导航点击数
- `misnavigationCount`: 误跳转计数
- `flows[]`: 每条关键流统计
  - `flowKey`: `<processKey>:<path>`
  - `samples`: 样本数
  - `clickAvg`: 平均点击步数
  - `reachAvg`: 平均到达耗时(ms)
  - `baseline`: 基线指标（若存在）
  - `clickImprovementPct`: 点击步数改善率（正值表示改善）
  - `timeImprovementPct`: 到达耗时改善率（正值表示改善）

## 2. 基线与改造后对比

- 基线由 `navigation-metrics.ts` 中 `BASELINE` 提供。
- 改造后指标来自会话真实采集 records。
- 建议至少每条关键流采集 3 次再比较。

## 3. 验收阈值

`evaluateNavigationAcceptance()` 默认阈值：

- `keyFlowMinClickImprovementPct >= 20`
- `keyFlowMinTimeImprovementPct >= 15`
- `maxMisnavigationCount <= 2`

若任一关键流未达阈值，返回 `pass: false` 并在 `failures.flowFailures` 中列出。
