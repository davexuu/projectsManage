import { useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import { api } from "../../api/client";
import { getErrorMessage } from "../../utils/errors";

export interface LoginUser {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

interface Props {
  onLogin: (user: LoginUser) => void;
}

export function LoginPanel({ onLogin }: Props) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@123");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.login({ username, password });
      localStorage.setItem("pmp_token", res.token);
      onLogin(res.user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Card title="PMP 项目管理系统" style={{ width: 420 }}>
        <Typography.Paragraph type="secondary">请先登录后使用。</Typography.Paragraph>
        <Form layout="vertical" onFinish={() => submit().catch((e) => message.error(getErrorMessage(e)))}>
          <Form.Item label="用户名" required>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </Form.Item>
          <Form.Item label="密码" required>
            <Input.Password value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            登录
          </Button>
        </Form>
        <Typography.Paragraph type="secondary" style={{ marginTop: 12 }}>
          测试账号：admin/Admin@123，pm/Pm@123456，member/Member@123
        </Typography.Paragraph>
      </Card>
    </div>
  );
}
