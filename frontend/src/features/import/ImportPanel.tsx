import { Button, Card, Col, Input, Row, Space, Typography } from "antd";

interface Props {
  importPath: string;
  setImportPath: (v: string) => void;
  importSummary: Record<string, unknown> | null;
  commitResult: Record<string, unknown> | null;
  onPreview: () => void;
  onCommit: () => void;
}

export function ImportPanel({ importPath, setImportPath, importSummary, commitResult, onPreview, onCommit }: Props) {
  return (
    <Card title="Excel 导入预览（已清洗）">
      <Row gutter={12}>
        <Col span={18}>
          <Typography.Text>Excel 文件路径</Typography.Text>
          <Input value={importPath} onChange={(e) => setImportPath(e.target.value)} />
        </Col>
        <Col span={6} style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end" }}>
          <Space>
            <Button onClick={onPreview}>预览解析</Button>
            <Button type="primary" onClick={onCommit}>
              一键入库
            </Button>
          </Space>
        </Col>
      </Row>
      {importSummary ? (
        <>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            预览摘要
          </Typography.Title>
          <pre>{JSON.stringify(importSummary, null, 2)}</pre>
        </>
      ) : null}
      {commitResult ? (
        <>
          <Typography.Title level={5} style={{ marginTop: 16 }}>
            入库结果
          </Typography.Title>
          <pre>{JSON.stringify(commitResult, null, 2)}</pre>
        </>
      ) : null}
    </Card>
  );
}

