import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  projectsCollection,
  tasksCollection,
  usersCollection,
} from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import type { Filter } from "mongodb";
import type { Task } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const priority = searchParams.get("priority");
  const dueFrom = searchParams.get("due_from");
  const dueTo = searchParams.get("due_to");

  const userId = new ObjectId(session.sub);
  const accessibleProjects = await (await projectsCollection())
    .find(
      { $or: [{ owner_id: userId }, { members: userId }] },
      { projection: { _id: 1, name: 1 } }
    )
    .toArray();
  const projectIds = accessibleProjects.map((p) => p._id);
  if (projectIds.length === 0) return NextResponse.json([]);

  const filter: Filter<Task> = { project_id: { $in: projectIds } };

  if (priority === "low" || priority === "medium" || priority === "high") {
    filter.priority = priority;
  }

  if (dueFrom || dueTo) {
    const range: { $gte?: Date; $lte?: Date } = {};
    if (dueFrom) range.$gte = new Date(dueFrom);
    if (dueTo) range.$lte = new Date(dueTo);
    filter.due_date = range;
  }

  if (q) {
    filter.$text = { $search: q };
  }

  const tasks = await (await tasksCollection())
    .find(filter)
    .sort(q ? { score: { $meta: "textScore" } } : { due_date: 1 })
    .limit(100)
    .toArray();

  const assigneeIds = Array.from(new Set(tasks.map((t) => t.assignee_id.toString()))).map(
    (id) => new ObjectId(id)
  );
  const users = assigneeIds.length
    ? await (await usersCollection())
        .find({ _id: { $in: assigneeIds } }, { projection: { name: 1 } })
        .toArray()
    : [];
  const userNameById = new Map(users.map((u) => [u._id.toString(), u.name]));
  const projectNameById = new Map(accessibleProjects.map((p) => [p._id.toString(), p.name]));

  return NextResponse.json(
    tasks.map((t) => ({
      id: t._id.toString(),
      title: t.title,
      description: t.description ?? "",
      priority: t.priority,
      due_date: t.due_date ? t.due_date.toISOString() : null,
      project_name: projectNameById.get(t.project_id.toString()) ?? "",
      assignee_name: userNameById.get(t.assignee_id.toString()) ?? "",
    }))
  );
}
