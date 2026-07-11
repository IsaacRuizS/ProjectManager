import { getDb } from "@/lib/db/mongodb";
import type { User, Project } from "@/types";

export async function usersCollection() {
  return (await getDb()).collection<User>("users");
}

export async function projectsCollection() {
  return (await getDb()).collection<Project>("projects");
}
