import { Button, Card, Col, Row, Select, Space } from "antd";
import { AppTable } from "../../components/AppTable";

interface UserOption {
  id: string;
  displayName: string;
  role: string;
}

interface MemberItem {
  id: string;
  userId: string;
  accessRole: string;
}

interface MemberForm {
  userId: string;
  accessRole: "OWNER" | "EDITOR" | "VIEWER";
}

interface Props {
  visible: boolean;
  users: UserOption[];
  members: MemberItem[];
  memberForm: MemberForm;
  setMemberForm: (form: MemberForm) => void;
  onSave: () => void;
}

export function ProjectMemberAccess({ visible, users, members, memberForm, setMemberForm, onSave }: Props) {
  if (!visible) return null;

  return (
    <Card title="项目成员权限">
      <Row gutter={12}>
        <Col xs={24} md={8}>
          <Select
            style={{ width: "100%" }}
            value={memberForm.userId}
            options={users.map((u) => ({ label: `${u.displayName}（${u.role}）`, value: u.id }))}
            onChange={(value) => setMemberForm({ ...memberForm, userId: value })}
            placeholder="选择用户"
          />
        </Col>
        <Col xs={24} md={8}>
          <Select
            style={{ width: "100%" }}
            value={memberForm.accessRole}
            options={[
              { label: "OWNER", value: "OWNER" },
              { label: "EDITOR", value: "EDITOR" },
              { label: "VIEWER", value: "VIEWER" }
            ]}
            onChange={(value) => setMemberForm({ ...memberForm, accessRole: value })}
          />
        </Col>
        <Col xs={24} md={8}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button type="primary" onClick={onSave}>
              保存权限
            </Button>
          </Space>
        </Col>
      </Row>

      <AppTable
        style={{ marginTop: 16 }}
        rowKey="id"
        columns={[
          { title: "成员记录ID", dataIndex: "id", key: "id" },
          { title: "用户ID", dataIndex: "userId", key: "userId" },
          { title: "项目权限", dataIndex: "accessRole", key: "accessRole" }
        ]}
        dataSource={members}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
