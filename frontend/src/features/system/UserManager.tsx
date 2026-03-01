import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Tree,
  message
} from "antd";
import type { DataNode } from "antd/es/tree";
import dayjs, { Dayjs } from "dayjs";
import { api, UserManageItem } from "../../api/client";
import { AppTable } from "../../components/AppTable";
import { getErrorMessage } from "../../utils/errors";
import type { OrganizationNode } from "./OrganizationManager";

type RoleCode = "ADMIN" | "PM" | "MEMBER";

interface Props {
  visible: boolean;
  role: "ADMIN" | "PM" | "MEMBER";
  orgTree: OrganizationNode[];
}

interface SearchState {
  officeId?: string;
  username?: string;
  mobile?: string;
  status?: "ENABLED" | "DISABLED";
  createdRange?: [Dayjs | null, Dayjs | null];
}

interface UserFormValues {
  username: string;
  displayName: string;
  password?: string;
  officeId?: string;
  mobile?: string;
  email?: string;
  status: "ENABLED" | "DISABLED";
  roleCode: RoleCode;
}

function toTreeData(nodes: OrganizationNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: node.id,
    title: node.name,
    children: toTreeData(node.children || [])
  }));
}

function flattenOffices(nodes: OrganizationNode[]): Array<{ label: string; value: string }> {
  const out: Array<{ label: string; value: string }> = [];
  const walk = (list: OrganizationNode[]) => {
    list.forEach((n) => {
      out.push({ label: n.name, value: n.id });
      walk(n.children || []);
    });
  };
  walk(nodes);
  return out;
}

function hasNodeName(node: OrganizationNode, text: string): boolean {
  if (node.name.includes(text)) return true;
  return (node.children || []).some((child) => hasNodeName(child, text));
}

function filterTree(nodes: OrganizationNode[], text: string): OrganizationNode[] {
  if (!text.trim()) return nodes;
  return nodes
    .filter((node) => hasNodeName(node, text.trim()))
    .map((node) => ({
      ...node,
      children: filterTree(node.children || [], text)
    }));
}

function roleTag(roleCode: RoleCode) {
  if (roleCode === "ADMIN") return <Tag color="red">管理员</Tag>;
  if (roleCode === "PM") return <Tag color="gold">项目经理</Tag>;
  return <Tag color="blue">项目成员</Tag>;
}

export function UserManager({ visible, role, orgTree }: Props) {
  const isAdmin = role === "ADMIN";
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<UserManageItem[]>([]);
  const [search, setSearch] = useState<SearchState>({});
  const [treeKeyword, setTreeKeyword] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserManageItem | null>(null);
  const [form] = Form.useForm<UserFormValues>();

  const officeOptions = useMemo(() => flattenOffices(orgTree), [orgTree]);
  const treeData = useMemo(() => toTreeData(filterTree(orgTree, treeKeyword)), [orgTree, treeKeyword]);

  const load = async (query: SearchState = search) => {
    setLoading(true);
    try {
      const list = await api.listUserManage({
        officeId: query.officeId,
        username: query.username,
        mobile: query.mobile,
        status: query.status,
        createdFrom: query.createdRange?.[0]?.format("YYYY-MM-DD"),
        createdTo: query.createdRange?.[1]?.format("YYYY-MM-DD")
      });
      setRows(list);
    } catch (e) {
      message.error(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      load().catch((e) => message.error(getErrorMessage(e)));
    }
  }, [visible]);

  if (!visible) return null;

  const selectedId = selectedKeys[0] || "";
  const selectedRow = rows.find((r) => r.id === selectedId) || null;

  return (
    <Row gutter={12}>
      <Col xs={24} lg={5}>
        <Card title="部门" size="small">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input placeholder="请输入部门名称" value={treeKeyword} onChange={(e) => setTreeKeyword(e.target.value)} />
            <Tree
              treeData={treeData}
              selectedKeys={search.officeId ? [search.officeId] : []}
              onSelect={(keys) => {
                const officeId = String(keys[0] || "");
                const next = { ...search, officeId: officeId || undefined };
                setSearch(next);
                load(next).catch((e) => message.error(getErrorMessage(e)));
              }}
            />
          </Space>
        </Card>
      </Col>

      <Col xs={24} lg={19}>
        <Card size="small" style={{ marginBottom: 12 }}>
          <Row gutter={8}>
            <Col xs={24} md={8}>
              <Input
                placeholder="请输入用户名"
                value={search.username}
                onChange={(e) => setSearch((prev) => ({ ...prev, username: e.target.value }))}
              />
            </Col>
            <Col xs={24} md={8}>
              <Input
                placeholder="请输入手机号"
                value={search.mobile}
                onChange={(e) => setSearch((prev) => ({ ...prev, mobile: e.target.value }))}
              />
            </Col>
            <Col xs={24} md={8}>
              <Select
                style={{ width: "100%" }}
                allowClear
                placeholder="用户状态"
                value={search.status}
                options={[
                  { label: "正常", value: "ENABLED" },
                  { label: "停用", value: "DISABLED" }
                ]}
                onChange={(value) => setSearch((prev) => ({ ...prev, status: value }))}
              />
            </Col>
            <Col xs={24} md={10} style={{ marginTop: 8 }}>
              <DatePicker.RangePicker
                style={{ width: "100%" }}
                value={search.createdRange}
                onChange={(value) => setSearch((prev) => ({ ...prev, createdRange: value ?? undefined }))}
              />
            </Col>
            <Col xs={24} md={14} style={{ marginTop: 8 }}>
              <Space>
                <Button type="primary" onClick={() => load().catch((e) => message.error(getErrorMessage(e)))}>
                  搜索
                </Button>
                <Button
                  onClick={() => {
                    const reset: SearchState = {};
                    setSearch(reset);
                    load(reset).catch((e) => message.error(getErrorMessage(e)));
                  }}
                >
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        <Card
          size="small"
          title="用户列表"
          extra={
            <Space>
              <Button
                type="primary"
                disabled={!isAdmin}
                onClick={() => {
                  setEditing(null);
                  form.setFieldsValue({
                    status: "ENABLED",
                    roleCode: "MEMBER"
                  });
                  setDialogOpen(true);
                }}
              >
                新增
              </Button>
              <Button
                disabled={!isAdmin || !selectedRow}
                onClick={() => {
                  if (!selectedRow) return;
                  setEditing(selectedRow);
                  form.setFieldsValue({
                    username: selectedRow.username,
                    displayName: selectedRow.displayName,
                    officeId: selectedRow.officeId,
                    mobile: selectedRow.mobile,
                    email: selectedRow.email,
                    status: selectedRow.status,
                    roleCode: selectedRow.roleCode
                  });
                  setDialogOpen(true);
                }}
              >
                修改
              </Button>
              <Popconfirm
                title="确认删除该用户？"
                onConfirm={async () => {
                  if (!selectedRow) return;
                  try {
                    await api.deleteUserManage(selectedRow.id);
                    message.success("删除成功");
                    setSelectedKeys([]);
                    await load();
                  } catch (e) {
                    message.error(getErrorMessage(e));
                  }
                }}
              >
                <Button danger disabled={!isAdmin || !selectedRow}>
                  删除
                </Button>
              </Popconfirm>
            </Space>
          }
        >
          <AppTable<UserManageItem>
            loading={loading}
            rowKey="id"
            rowSelection={{
              type: "radio",
              selectedRowKeys: selectedKeys,
              onChange: (keys) => setSelectedKeys(keys.map(String))
            }}
            columns={[
              { title: "用户编号", key: "idx", width: 90, render: (_v, _r, idx) => idx + 1 },
              { title: "用户名", dataIndex: "username", key: "username" },
              { title: "用户昵称", dataIndex: "displayName", key: "displayName" },
              { title: "部门", dataIndex: "officeName", key: "officeName" },
              { title: "手机号", dataIndex: "mobile", key: "mobile" },
              { title: "角色", dataIndex: "roleCode", key: "roleCode", render: (v) => roleTag(v as RoleCode) },
              {
                title: "状态",
                dataIndex: "status",
                key: "status",
                render: (_v, row) => (
                  <Switch
                    checked={row.status === "ENABLED"}
                    checkedChildren="启用"
                    unCheckedChildren="停用"
                    disabled={!isAdmin}
                    onChange={async (checked) => {
                      try {
                        await api.updateUserStatus(row.id, checked ? "ENABLED" : "DISABLED");
                        setRows((prev) =>
                          prev.map((item) => (item.id === row.id ? { ...item, status: checked ? "ENABLED" : "DISABLED" } : item))
                        );
                      } catch (e) {
                        message.error(getErrorMessage(e));
                      }
                    }}
                  />
                )
              },
              {
                title: "创建时间",
                dataIndex: "createdAt",
                key: "createdAt",
                render: (v: unknown) => dayjs(String(v)).format("YYYY-MM-DD HH:mm:ss")
              },
              {
                title: "操作",
                key: "action",
                render: (_v, row) => (
                  <Space size={4}>
                    <Button
                      type="link"
                      size="small"
                      disabled={!isAdmin}
                      onClick={() => {
                        setEditing(row);
                        form.setFieldsValue({
                          username: row.username,
                          displayName: row.displayName,
                          officeId: row.officeId,
                          mobile: row.mobile,
                          email: row.email,
                          status: row.status,
                          roleCode: row.roleCode
                        });
                        setDialogOpen(true);
                      }}
                    >
                      编辑
                    </Button>
                  </Space>
                )
              }
            ]}
            dataSource={rows}
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        </Card>
      </Col>

      <Modal
        open={dialogOpen}
        title={editing ? "修改用户" : "新增用户"}
        onCancel={() => {
          setDialogOpen(false);
          form.resetFields();
        }}
        onOk={async () => {
          try {
            const values = await form.validateFields();
            if (editing) {
              await api.updateUserManage(editing.id, values);
              message.success("修改成功");
            } else {
              await api.createUserManage(values);
              message.success("新增成功");
            }
            setDialogOpen(false);
            form.resetFields();
            await load();
          } catch (e) {
            message.error(getErrorMessage(e));
          }
        }}
        okButtonProps={{ disabled: !isAdmin }}
      >
        <Form form={form} layout="vertical" initialValues={{ status: "ENABLED", roleCode: "MEMBER" }}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item label="用户名" name="username" rules={[{ required: true, message: "请输入用户名" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="昵称" name="displayName" rules={[{ required: true, message: "请输入昵称" }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={editing ? "重置密码（可选）" : "密码"}
                name="password"
                rules={editing ? [] : [{ required: true, message: "请输入密码（至少6位）" }]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="手机号" name="mobile">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="邮箱" name="email">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="部门" name="officeId">
                <Select allowClear options={officeOptions} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="角色" name="roleCode" rules={[{ required: true, message: "请选择角色" }]}>
                <Select
                  options={[
                    { label: "系统管理员", value: "ADMIN" },
                    { label: "项目经理", value: "PM" },
                    { label: "项目成员", value: "MEMBER" }
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="状态" name="status" rules={[{ required: true, message: "请选择状态" }]}>
                <Select
                  options={[
                    { label: "正常", value: "ENABLED" },
                    { label: "停用", value: "DISABLED" }
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Row>
  );
}
