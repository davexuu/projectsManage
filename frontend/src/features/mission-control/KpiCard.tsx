import { Card, Statistic, Tag } from 'antd';
import { KpiCardConfig } from './types';

interface Props {
  config: KpiCardConfig;
  value: number | string;
  onClick: () => void;
}

export function KpiCard({ config, value, onClick }: Props) {
  return (
    <Card
      className="mission-control-motion"
      hoverable
      onClick={onClick}
      style={{ borderTop: `3px solid ${config.color}`, cursor: 'pointer' }}
      bodyStyle={{ paddingBottom: 14 }}
    >
      <Tag color={config.color} style={{ marginBottom: 10 }}>
        KPI
      </Tag>
      <Statistic title={config.label} value={value} suffix={config.unit} />
    </Card>
  );
}
