declare module "frappe-gantt" {
  export interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress?: number;
    dependencies?: string;
    custom_class?: string;
  }

  export interface GanttOptions {
    view_mode?: "Quarter Day" | "Half Day" | "Day" | "Week" | "Month" | "Year";
    language?: string;
    date_format?: string;
    readonly?: boolean;
    on_click?: (task: GanttTask) => void;
  }

  export default class Gantt {
    constructor(wrapper: string | HTMLElement, tasks: GanttTask[], options?: GanttOptions);
    change_view_mode(mode: GanttOptions["view_mode"]): void;
    refresh(tasks: GanttTask[]): void;
  }
}

