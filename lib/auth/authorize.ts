import { ObjectId } from "mongodb";
import { projectsCollection } from "@/lib/db/collections";
import type { SessionPayload } from "@/types";

export async function getAccessibleProject(projectId: string, session: SessionPayload) {
  const projects = await projectsCollection();
  const userId = new ObjectId(session.sub);
  return projects.findOne({
    _id: new ObjectId(projectId),
    $or: [{ owner_id: userId }, { members: userId }],
  });
}
