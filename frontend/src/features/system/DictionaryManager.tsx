import { useMemo, useState } from "react";
import { Button, Card, Col, Input, message, Row, Select } from "antd";
import { AppTable } from "../../components/AppTable";

export interface DictionaryItem {
  key: string;
  label: string;
  options: string[];
}

interface Props {
  visible: boolean;
  items: DictionaryItem[];
  onAddOption: (dictKey: string, value: string) => Promise<void>;
  onRemoveOption: (dictKey: string, value: string) => Promise<void>;
}

export function DictionaryManager({ visible, items, onAddOption, onRemoveOption }: Props) {
  const [activeKey, setActiveKey] = useState(items[0]?.key ?? "");
  const [newOption, setNewOption] = useState("");

  const activeItem = useMemo(() => items.find((item) => item.key === activeKey) ?? items[0], [items, activeKey]);

  if (!visible) {
    return <Card>仅管理员或项目经理可维护字典。</Card>;
  }

  if (!activeItem) {
    return <Card>暂无可维护字典。</Card>;
  }

  const addOption = async () => {
    const val = newOption.trim();
    if (!val) return;
    if (activeItem.options.includes(val)) {
      message.warning("字典值已存在");
      return;
    }
    await onAddOption(activeItem.key, val);
    setNewOption("");
  };

  return (
    <Card title="字典表维护">
      <Row gutter={12}>
        <Col xs={24} md={8}>
          <Select
            style={{ width: "100%" }}
            value={activeItem.key}
            options={items.map((item) => ({ label: item.label, value: item.key }))}
            onChange={setActiveKey}
          />
        </Col>
        <Col xs={24} md={12}>
          <Input value={newOption} onChange={(e) => setNewOption(e.target.value)} placeholder={`请输入${activeItem.label}`} />
        </Col>
        <Col xs={24} md={4}>
          <Button type="primary" block onClick={addOption}>
            新增
          </Button>
        </Col>
      </Row>

      <AppTable
        style={{ marginTop: 16 }}
        rowKey={(row) => String(row.option)}
        columns={[
          { title: "序号", dataIndex: "index", key: "index", width: 80 },
          { title: "字典值", dataIndex: "option", key: "option" },
          {
            title: "操作",
            key: "action",
            width: 120,
            render: (_: unknown, row: { option: string }) => (
              <Button danger size="small" onClick={() => onRemoveOption(activeItem.key, row.option)}>
                删除
              </Button>
            )
          }
        ]}
        dataSource={activeItem.options.map((option, index) => ({ key: option, index: index + 1, option }))}
        locale={{ emptyText: "暂无字典值" }}
        pagination={false}
      />
    </Card>
  );
}
