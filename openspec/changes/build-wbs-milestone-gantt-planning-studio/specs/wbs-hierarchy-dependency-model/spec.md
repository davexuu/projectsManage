## ADDED Requirements

### Requirement: Structured WBS hierarchy model
系统 MUST 为 WBS 任务提供结构化层级模型，至少包含层级编码、父子关系和排序信息。

#### Scenario: Create child task under parent
- **WHEN** 用户在某父任务下新增子任务
- **THEN** 系统 MUST 记录该子任务的父任务标识
- **THEN** 系统 MUST 生成或保存可用于展示的层级编码与排序信息

#### Scenario: Retrieve WBS as hierarchical structure
- **WHEN** 客户端请求项目 WBS 数据
- **THEN** 系统 MUST 返回可构建树形视图所需的层级字段
- **THEN** 系统 MUST 保证同一父节点下排序结果稳定

### Requirement: Task dependency relationship management
系统 MUST 支持定义 WBS 任务依赖关系，并在保存前执行依赖合法性校验。

#### Scenario: Save dependency without cycles
- **WHEN** 用户为任务设置前置依赖且依赖关系无环
- **THEN** 系统 MUST 成功保存依赖关系
- **THEN** 系统 MUST 在查询结果中返回该依赖信息

#### Scenario: Reject cyclic dependencies
- **WHEN** 用户提交会形成依赖环的依赖关系
- **THEN** 系统 MUST 拒绝本次保存
- **THEN** 系统 MUST 返回可定位到任务的错误信息

### Requirement: Batch write with transactional integrity
系统 MUST 提供 WBS 批量写入能力，并保证批量提交具备事务一致性。

#### Scenario: Batch create succeeds
- **WHEN** 用户提交的批量 WBS 数据全部通过校验
- **THEN** 系统 MUST 一次性写入全部任务记录
- **THEN** 系统 MUST 返回创建成功的记录摘要

#### Scenario: Batch create partially invalid
- **WHEN** 批量数据中任一记录校验失败
- **THEN** 系统 MUST 回滚本次批量写入
- **THEN** 系统 MUST 返回逐行错误明细
