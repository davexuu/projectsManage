## ADDED Requirements

### Requirement: Planning entry MUST converge to planning studio
系统 MUST 在规划阶段提供“计划编排工作台”作为主入口，确保用户在单页面完成 WBS、里程碑与甘特联动操作。

#### Scenario: Open planning process navigation
- **WHEN** 用户进入规划过程导航
- **THEN** 系统 MUST 显示“计划编排工作台”入口
- **THEN** 系统 MUST 将该入口指向统一的规划工作台页面

#### Scenario: Enter planning studio from planning process
- **WHEN** 用户点击“计划编排工作台”入口
- **THEN** 系统 MUST 打开规划工作台并继承当前项目上下文
- **THEN** 系统 MUST 在工作台中可见 WBS、里程碑、甘特三个联动区域

### Requirement: Legacy compatibility menu MUST be removed in development stage
系统 MUST 移除“兼容入口”菜单组，避免规划主链路出现重复入口。

#### Scenario: Render main side menu
- **WHEN** 系统渲染左侧主菜单
- **THEN** 菜单中 MUST NOT 出现“兼容入口”分组
- **THEN** 规划相关入口 MUST 仅通过项目空间与过程导航的收敛结构暴露

#### Scenario: User accesses old planning route from bookmark
- **WHEN** 用户通过旧书签访问已下线的兼容菜单路径
- **THEN** 系统 MUST 提供可恢复操作的引导（重定向或明确提示）
- **THEN** 系统 MUST 指向当前规划主入口而非不可达页面
