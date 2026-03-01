# 导航效率验收记录

## 验收阈值

- 关键流点击步数改善率 >= 20%
- 关键流到达耗时改善率 >= 15%
- 会话误跳转次数 <= 2

## 必测关键流

1. 启动过程 -> 项目立项卡 (`start:/module/projects`)
2. 规划过程 -> WBS任务分解 (`plan:/module/wbs`)
3. 执行过程 -> 任务看板 (`execute:/kanban`)
4. 监控过程 -> 周报月报 (`monitor:/process/monitor/reports`)
5. 收尾过程 -> 项目状态评估 (`close:/module/statusAssessments`)

## 回归结论（待执行）

- 状态：Pending Manual Validation
- 说明：当前已完成代码实现与构建校验，需在真实浏览器按回归清单采集样本后填写最终通过/阻断结论。
