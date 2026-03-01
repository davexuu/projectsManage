## WBS Enhanced Entry Validation Checklist

### Project context & gating

- [ ] 从项目详情页进入 WBS 新增，`projectId` 自动带入
- [ ] 未选择项目时，WBS “新增记录”按钮禁用
- [ ] 未选择项目时无法提交 WBS 分解项

### Field guidance & optional fields

- [ ] 必填字段显示“必填”标记
- [ ] 推荐字段显示“建议填”标记
- [ ] 自动带入字段显示“自动带入”标记
- [ ] 字段填写要求与示例正常显示（helpText/example）
- [ ] 可选字段默认折叠，点击“展开更多字段”后可见
- [ ] `riskHint` 在 `currentStatus=延期` 时显示，其他状态隐藏

### WBS batch decomposition entry

- [ ] 可将当前录入内容加入“分解项列表”
- [ ] 可编辑已加入行并更新
- [ ] 可复制行（仅继承允许复制/继承字段）
- [ ] 可删除行
- [ ] 连续新增后，继承字段自动带入下一条
- [ ] 新增行默认值继承不覆盖本行已手动输入值（通过“加入后准备下一条”验证）

### Validation & error targeting

- [ ] `plannedEndDate < plannedStartDate` 时阻止加入并提示错误
- [ ] 批量提交前存在非法行时展示错误摘要
- [ ] 非法行在列表中高亮（行级错误高亮）
- [ ] 校验失败后已录入分解项不丢失

### Table visual standard (Element-like)

- [ ] WBS 列表表头样式统一（浅色表头、边框清晰）
- [ ] WBS 列表支持斑马纹与 hover 高亮
- [ ] WBS 录入中的分解项表格使用同一风格
- [ ] 表格空状态文案与布局稳定
- [ ] 表格分页区域样式统一

### Compatibility & fallback

- [ ] 批量提交后后端成功创建所有记录（无接口字段缺失）
- [ ] 单条编辑流程（编辑 WBS）仍可正常保存
- [ ] 关闭 `moduleFeatureFlags.wbsEnhancedEntry` 后回退到旧单表单录入
- [ ] 关闭 `moduleFeatureFlags.elementLikeTableTheme` 后回退到默认表格样式

