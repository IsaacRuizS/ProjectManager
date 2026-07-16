import type { ProjectStatus, TaskPriority } from "@/types";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  active: "Activo",
  paused: "Pausado",
  finished: "Terminado",
};

export const PROJECT_STATUS_OPTIONS: ProjectStatus[] = ["active", "paused", "finished"];

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};
