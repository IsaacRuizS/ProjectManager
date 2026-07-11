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

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}
