import { useMemo, useState } from "react";
import { Button, Card, Input, Modal, Space, Tree, Typography } from "antd";

export interface OrganizationNode {
  id: string;
  name: string;
  children: OrganizationNode[];
}

interface Props {
  visible: boolean;
  tree: OrganizationNode[];
  onAddRoot: (name: string) => Promise<void>;
  onAddChild: (parentId: string, name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

type ActionType = "addRoot" | "addChild" | "rename" | null;

function toTreeData(nodes: OrganizationNode[]): any[] {
  return nodes.map((node) => ({
    key: node.id,
    title: node.name,
    children: toTreeData(node.children)
  }));
}

export function OrganizationManager({ visible, tree, onAddRoot, onAddChild, onRename, onDelete }: Props) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [action, setAction] = useState<ActionType>(null);
  const [inputValue, setInputValue] = useState("");
  const treeData = useMemo(() => toTreeData(tree), [tree]);

  if (!visible) {
    return <Card>仅管理员或项目经理可维护组织机构。</Card>;
  }

  const openAction = (nextAction: ActionType) => {
    setAction(nextAction);
    setInputValue("");
  };

  const handleOk = async () => {
    const value = inputValue.trim();
    if (!value) return;
    if (action === "addRoot") await onAddRoot(value);
    if (action === "addChild" && selectedId) await onAddChild(selectedId, value);
    if (action === "rename" && selectedId) await onRename(selectedId, value);
    setAction(null);
    setInputValue("");
  };

  const title =
    action === "addRoot" ? "新增一级组织" : action === "addChild" ? "新增下级组织" : action === "rename" ? "重命名组织" : "";

  return (
    <Card
      title="组织机构维护"
      extra={
        <Space>
          <Button onClick={() => openAction("addRoot")}>新增一级组织</Button>
          <Button disabled={!selectedId} onClick={() => openAction("addChild")}>
            新增下级
          </Button>
          <Button disabled={!selectedId} onClick={() => openAction("rename")}>
            重命名
          </Button>
          <Button
            danger
            disabled={!selectedId}
            onClick={() =>
              Modal.confirm({
                title: "删除该组织及其全部下级？",
                onOk: () => onDelete(selectedId)
              })
            }
          >
            删除
          </Button>
        </Space>
      }
    >
      <Typography.Paragraph type="secondary">请选择组织节点后进行“新增下级、重命名、删除”操作。</Typography.Paragraph>
      <Tree
        treeData={treeData}
        selectedKeys={selectedId ? [selectedId] : []}
        onSelect={(keys) => setSelectedId(String(keys[0] ?? ""))}
        defaultExpandAll
      />

      <Modal title={title} open={!!action} onOk={() => handleOk().catch(() => null)} onCancel={() => setAction(null)}>
        <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="请输入组织名称" />
      </Modal>
    </Card>
  );
}

