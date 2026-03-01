## ADDED Requirements

### Requirement: Kanban task card displays stage information
任务看板中的每个任务卡片 SHALL 显示任务所属阶段信息，数据来源为任务记录中的一级阶段字段（如 `level1Stage`）。

#### Scenario: Task card has stage value
- **WHEN** 看板加载到包含阶段字段的任务数据
- **THEN** 每个任务卡片 SHALL 显示“阶段：<值>”文本

#### Scenario: Task card stage value is missing
- **WHEN** 某任务的阶段字段为空或缺失
- **THEN** 任务卡片 SHALL 显示占位值（如 `-`）而不是隐藏该行

### Requirement: Kanban task card displays planned date range
任务看板中的每个任务卡片 SHALL 显示计划起止时间，并对缺失日期使用统一占位规则，避免信息区域缺失。

#### Scenario: Task card has both planned start and end dates
- **WHEN** 某任务同时存在计划开始和计划结束日期
- **THEN** 任务卡片 SHALL 显示格式化的计划时间范围（如“计划：MM-DD 至 MM-DD”）

#### Scenario: Task card is missing one side of planned dates
- **WHEN** 某任务仅存在计划开始日期或仅存在计划结束日期
- **THEN** 任务卡片 SHALL 在缺失一侧显示“待定”
- **THEN** 任务卡片 SHALL 保持完整“计划：开始 至 结束”结构

#### Scenario: Task card is missing both planned dates
- **WHEN** 某任务计划开始和计划结束日期都为空或缺失
- **THEN** 任务卡片 SHALL 显示“计划：待定”或等效统一占位文案

