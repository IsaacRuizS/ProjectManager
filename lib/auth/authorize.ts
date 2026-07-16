import { ObjectId } from "mongodb";
import { projectsCollection, tasksCollection } from "@/lib/db/collections";
import type { SessionPayload } from "@/types";

export async function getAccessibleProject(projectId: string, session: SessionPayload) {
  const projects = await projectsCollection();
  const userId = new ObjectId(session.sub);
  return projects.findOne({
    _id: new ObjectId(projectId),
    $or: [{ owner_id: userId }, { members: userId }],
  });
}

export async function getAccessibleTask(taskId: string, session: SessionPayload) {
  const tasks = await tasksCollection();
  const task = await tasks.findOne({ _id: new ObjectId(taskId) });
  if (!task) return null;
  const project = await getAccessibleProject(task.project_id.toString(), session);
  if (!project) return null;
  return { task, project };
}
