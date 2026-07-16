import { getDb } from "@/lib/db/mongodb";
import type { User, Project, Column, Task, Comment } from "@/types";

export async function usersCollection() {
  return (await getDb()).collection<User>("users");
}

export async function projectsCollection() {
  return (await getDb()).collection<Project>("projects");
}

export async function columnsCollection() {
  return (await getDb()).collection<Column>("columns");
}

export async function tasksCollection() {
  return (await getDb()).collection<Task>("tasks");
}

export async function commentsCollection() {
  return (await getDb()).collection<Comment>("comments");
}
