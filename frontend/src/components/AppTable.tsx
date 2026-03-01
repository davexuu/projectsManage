import type { TableProps } from "antd";
import ProTable from "@ant-design/pro-table";
import type { ProColumns } from "@ant-design/pro-table";

type AppTableVariant = "default" | "element-like";

export interface AppTableProps<RecordType extends object> extends TableProps<RecordType> {
  variant?: AppTableVariant;
}

export function AppTable<RecordType extends object>(props: AppTableProps<RecordType>) {
  const { pagination, locale, size, className, columns, dataSource, variant = "default", ...rest } = props;

  const resolvedPagination =
    pagination === false
      ? false
      : {
          showSizeChanger: true,
          defaultPageSize: 20,
          ...(typeof pagination === "object" ? pagination : {})
        };

  return (
    <ProTable<RecordType, Record<string, never>>
      className={["app-table", variant === "element-like" ? "app-table--element" : "", className].filter(Boolean).join(" ")}
      columns={(columns ?? []) as ProColumns<RecordType>[]}
      dataSource={dataSource as RecordType[] | undefined}
      bordered
      size={size ?? "small"}
      locale={{ emptyText: "暂无数据", ...(locale ?? {}) }}
      pagination={resolvedPagination}
      search={false}
      options={false}
      toolBarRender={false}
      tableAlertRender={false}
      tableAlertOptionRender={false}
      {...rest}
    />
  );
}
