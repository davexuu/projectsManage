## ADDED Requirements

### Requirement: System-generated WBS code in quick decomposition
系统 MUST 在快速分解提交链路中自动生成 WBS 编码，默认不要求用户手工填写编码。

#### Scenario: Auto-generate code when field is omitted
- **WHEN** 用户提交的快速分解行未提供 `wbsCode`
- **THEN** 系统 MUST 按统一规则生成合法编码
- **THEN** 生成编码 MUST 满足既有格式校验规则（如 `1` 或 `1.2.3`）

#### Scenario: Preserve compatibility with existing validations
- **WHEN** 自动编码后的记录进入保存流程
- **THEN** 系统 MUST 与现有 `createWbsSchema`、批量写入和查询接口兼容
- **THEN** 系统 MUST 保证编码可用于列表排序和展示

### Requirement: Read-only code presentation in quick decomposition UI
系统 MUST 在快速分解 UI 中将 WBS 编码以只读或自动状态展示，避免用户将其作为主输入字段。

#### Scenario: Display generated code state
- **WHEN** 用户打开快速分解弹窗并准备录入任务
- **THEN** 页面 MUST 明确显示编码由系统自动生成的状态
- **THEN** 页面 MUST 提供编码规则说明入口以降低理解成本
