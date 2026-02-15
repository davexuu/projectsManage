export type FieldType = "text" | "textarea" | "select" | "multiselect" | "date" | "number";

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  hint?: string;
}

export type FormSchemaMap = Record<string, FormField[]>;

export interface ModuleConfig {
  key: string;
  label: string;
  endpoint: string;
}
