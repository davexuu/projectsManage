export type FieldType = "text" | "textarea" | "select" | "multiselect" | "date" | "number";
export type FieldPriority = "core" | "recommended" | "optional" | "auto";
export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FieldVisibilityRule {
  key: string;
  equals?: string;
  notEquals?: string;
  isTruthy?: boolean;
}

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[] | FormFieldOption[];
  hint?: string;
  priority?: FieldPriority;
  placeholder?: string;
  helpText?: string;
  example?: string;
  section?: "context" | "detail" | "advanced";
  visibleWhen?: FieldVisibilityRule;
  defaultValueResolver?: "selectedProjectId" | "previousRow";
  inheritable?: boolean;
  readonly?: boolean;
}

export type FormSchemaMap = Record<string, FormField[]>;

export interface ModuleConfig {
  key: string;
  label: string;
  endpoint: string;
}
