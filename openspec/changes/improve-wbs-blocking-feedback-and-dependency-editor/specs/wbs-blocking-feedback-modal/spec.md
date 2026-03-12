## ADDED Requirements

### Requirement: Blocking submission errors MUST be shown in modal with action guidance
当 WBS 批量提交被后端阻断时，系统 MUST 使用强提示弹窗展示错误，并明确告诉用户“问题是什么、怎么改、去哪里操作”。

#### Scenario: Structural change approval blocks WBS submission
- **WHEN** 用户提交分解项，后端返回 409 且错误为“存在未审批且影响里程碑/WBS的变更”
- **THEN** 系统 MUST 弹出阻断错误弹窗而非仅顶部提示
- **THEN** 弹窗 MUST 展示变更编号、阻断原因和处理步骤

### Requirement: Blocking modal MUST provide direct operation entry
阻断弹窗 MUST 提供直达处理入口，减少用户在模块间自行查找。

#### Scenario: User chooses to handle blocking issue
- **WHEN** 用户在阻断弹窗点击“去处理变更单”
- **THEN** 系统 MUST 跳转到变更管理入口并保留当前草稿上下文
- **THEN** 用户返回后 MUST 能继续提交当前分解项
