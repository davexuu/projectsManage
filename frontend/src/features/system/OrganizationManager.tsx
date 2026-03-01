import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Modal, Select, Space, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AppTable } from "../../components/AppTable";

export interface OrganizationNode {
  id: string;
  name: string;
  sort?: number;
  status?: string;
  createdAt?: string;
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

interface OrganizationRow {
  key: string;
  id: string;
  name: string;
  sort: number;
  status: string;
  createdAt: string;
  depth: number;
  children: OrganizationRow[];
}

function toTreeRows(nodes: OrganizationNode[], depth = 0): OrganizationRow[] {
  return nodes.map((node, index) => ({
    key: node.id,
    id: node.id,
    name: node.name,
    sort: node.sort ?? index,
    status: node.status ?? "正常",
    createdAt: node.createdAt ?? "-",
    depth,
    children: toTreeRows(node.children, depth + 1)
  }));
}

function filterTreeRows(nodes: OrganizationRow[], keyword: string): OrganizationRow[] {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) return nodes;
  return nodes
    .map((node) => {
      const children = filterTreeRows(node.children, normalized);
      const matches = node.name.toLowerCase().includes(normalized);
      if (!matches && children.length === 0) return null;
      return { ...node, children };
    })
    .filter((node): node is OrganizationRow => !!node);
}

function filterByStatus(nodes: OrganizationRow[], status: string): OrganizationRow[] {
  if (!status) return nodes;
  return nodes
    .map((node) => {
      const children = filterByStatus(node.children, status);
      const matches = node.status === status;
      if (!matches && children.length === 0) return null;
      return { ...node, children };
    })
    .filter((node): node is OrganizationRow => !!node);
}

function collectIds(nodes: OrganizationRow[]): string[] {
  return nodes.flatMap((node) => [node.id, ...collectIds(node.children)]);
}

function flattenRows(nodes: OrganizationRow[]): OrganizationRow[] {
  return nodes.flatMap((node) => [node, ...flattenRows(node.children)]);
}

export function OrganizationManager({ visible, tree, onAddRoot, onAddChild, onRename, onDelete }: Props) {
  const [selectedId, setSelectedId] = useState<string>("");
  const [action, setAction] = useState<ActionType>(null);
  const [inputValue, setInputValue] = useState("");
  const [nameFilterInput, setNameFilterInput] = useState("");
  const [statusFilterInput, setStatusFilterInput] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const treeRows = useMemo(() => toTreeRows(tree), [tree]);
  const filteredRows = useMemo(
    () => filterByStatus(filterTreeRows(treeRows, nameFilter), statusFilter),
    [treeRows, nameFilter, statusFilter]
  );
  const allExpandedKeys = useMemo(() => collectIds(filteredRows), [filteredRows]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const rowMap = useMemo(() => new Map(flattenRows(treeRows).map((item) => [item.id, item])), [treeRows]);
  const statusOptions = useMemo(() => {
    const set = new Set(flattenRows(treeRows).map((item) => item.status));
    if (set.size === 0) set.add("正常");
    return [...set];
  }, [treeRows]);

  useEffect(() => {
    setExpandedRowKeys(allExpandedKeys);
  }, [allExpandedKeys]);

  if (!visible) {
    return <Card>仅管理员或项目经理可维护组织机构。</Card>;
  }

  const openAction = (nextAction: ActionType) => {
    setAction(nextAction);
    if (nextAction === "rename" && selectedId) {
      setInputValue(rowMap.get(selectedId)?.name ?? "");
      return;
    }
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

  const columns: ColumnsType<OrganizationRow> = [
    {
      title: "部门名称",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "排序",
      dataIndex: "sort",
      key: "sort",
      width: 100
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value: string) => <Tag color={value === "正常" ? "blue" : "default"}>{value}</Tag>
    },
    {
      title: "创建时间",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 200
    },
    {
      title: "操作",
      key: "action",
      width: 220,
      render: (_: unknown, row: OrganizationRow) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedId(row.id);
              openAction("rename");
            }}
          >
            修改
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedId(row.id);
              openAction("addChild");
            }}
          >
            新增
          </Button>
          {row.depth > 0 ? (
            <Button
              type="link"
              size="small"
              danger
              onClick={() =>
                Modal.confirm({
                  title: "删除该组织及其全部下级？",
                  onOk: () => onDelete(row.id)
                })
              }
            >
              删除
            </Button>
          ) : null}
        </Space>
      )
    }
  ];

  return (
    <Card
      title="部门管理"
    >
      <Space className="org-dept-search" wrap>
        <Space>
          <span>部门名称</span>
          <Input
            value={nameFilterInput}
            onChange={(event) => setNameFilterInput(event.target.value)}
            placeholder="请输入部门名称"
            style={{ width: 220 }}
          />
        </Space>
        <Space>
          <span>状态</span>
          <Select
            allowClear
            value={statusFilterInput || undefined}
            options={statusOptions.map((item) => ({ label: item, value: item }))}
            placeholder="部门状态"
            onChange={(value) => setStatusFilterInput(value ?? "")}
            style={{ width: 180 }}
          />
        </Space>
        <Button
          type="primary"
          onClick={() => {
            setNameFilter(nameFilterInput.trim());
            setStatusFilter(statusFilterInput);
          }}
        >
          搜索
        </Button>
        <Button
          onClick={() => {
            setNameFilterInput("");
            setStatusFilterInput("");
            setNameFilter("");
            setStatusFilter("");
          }}
        >
          重置
        </Button>
      </Space>

      <Space className="org-dept-actions" wrap>
        <Button type="primary" onClick={() => openAction("addRoot")}>
          新增
        </Button>
        <Button
          onClick={() => {
            setExpandedRowKeys((prev) => (prev.length ? [] : allExpandedKeys));
          }}
        >
          {expandedRowKeys.length ? "折叠" : "展开"}
        </Button>
        <Button disabled={!selectedId} onClick={() => openAction("addChild")}>
          新增下级
        </Button>
        <Button disabled={!selectedId} onClick={() => openAction("rename")}>
          修改
        </Button>
        <Button
          danger
          disabled={!selectedId || (rowMap.get(selectedId)?.depth ?? 0) === 0}
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

      <AppTable<OrganizationRow>
        rowKey={(row) => row.id}
        columns={columns}
        dataSource={filteredRows}
        pagination={false}
        expandable={{
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys.map(String))
        }}
        onRow={(row) => ({
          onClick: () => setSelectedId(row.id)
        })}
        rowClassName={(row) => (row.id === selectedId ? "org-dept-row-selected" : "")}
      />

      <Modal title={title} open={!!action} onOk={() => handleOk().catch(() => null)} onCancel={() => setAction(null)}>
        <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="请输入组织名称" />
      </Modal>
    </Card>
  );
}
