import React from 'react';
import { Alert, Button, Card, Space, Typography } from 'antd';

interface Props {
  resetKey: string;
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class RouteErrorBoundary extends React.Component<Props, State> {
  state: State = {
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Card>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            页面加载失败
          </Typography.Title>
          <Alert
            type="error"
            showIcon
            message={error.message || '页面运行时发生异常'}
            description="已拦截白屏。可尝试刷新页面，或返回上一步后重试。"
          />
          <Space>
            <Button type="primary" onClick={() => window.location.reload()}>
              刷新页面
            </Button>
            <Button onClick={() => window.history.back()}>
              返回上一步
            </Button>
          </Space>
        </Space>
      </Card>
    );
  }
}
