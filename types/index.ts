import type { ObjectId } from "mongodb";

export type UserRole = "admin" | "member";

export interface User {
  _id: ObjectId;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
}

export type ProjectStatus = "active" | "paused" | "finished";

export interface Project {
  _id: ObjectId;
  name: string;
  description?: string;
  owner_id: ObjectId;
  members: ObjectId[];
  start_date: Date;
  due_date: Date;
  status: ProjectStatus;
}

export interface Column {
  _id: ObjectId;
  name: string;
  order: number;
  project_id: ObjectId;
  color?: string;
}

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  _id: ObjectId;
  title: string;
  description?: string;
  project_id: ObjectId;
  column_id: ObjectId;
  assignee_id: ObjectId;
  priority: TaskPriority;
  order: number;
  created_at: Date;
  due_date?: Date;
}

export interface Comment {
  _id: ObjectId;
  task_id: ObjectId;
  user_id: ObjectId;
  text: string;
  created_at: Date;
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}
