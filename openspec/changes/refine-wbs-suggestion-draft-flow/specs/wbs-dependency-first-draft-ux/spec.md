## ADDED Requirements

### Requirement: Dependency editing must be available in draft stage
系统 MUST 在草稿区提供紧前任务配置能力，并实时展示紧后关系反推结果。

#### Scenario: Configure predecessor in draft row
- **WHEN** 用户在草稿行中选择紧前任务
- **THEN** 系统 MUST 保存该草稿行的紧前关系
- **THEN** 系统 MUST 在界面中展示对应紧后关系

### Requirement: Dependency validation before draft-to-list transition
系统 MUST 在草稿加入分解列表前执行依赖合法性校验（至少包含自依赖、环依赖、时间冲突）。

#### Scenario: Reject invalid dependency during confirmation
- **WHEN** 用户尝试将存在依赖冲突的草稿行加入分解列表
- **THEN** 系统 MUST 拒绝该行加入
- **THEN** 系统 MUST 返回行级定位信息与冲突原因
