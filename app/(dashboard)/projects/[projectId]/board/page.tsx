import { ObjectId } from "mongodb";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  columnsCollection,
  projectsCollection,
  tasksCollection,
  usersCollection,
} from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { BoardClient } from "./_components/board-client";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await getSession();
  const userId = new ObjectId(session!.sub);

  const project = await (await projectsCollection()).findOne({
    _id: new ObjectId(projectId),
    $or: [{ owner_id: userId }, { members: userId }],
  });

  if (!project) notFound();

  const [columns, tasks] = await Promise.all([
    (await columnsCollection()).find({ project_id: project._id }).sort({ order: 1 }).toArray(),
    (await tasksCollection())
      .find({ project_id: project._id })
      .sort({ column_id: 1, order: 1 })
      .toArray(),
  ]);

  const memberIds = [project.owner_id, ...project.members];
  const members = await (await usersCollection())
    .find({ _id: { $in: memberIds } }, { projection: { name: 1, email: 1 } })
    .toArray();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/projects/${projectId}`}
            className="text-sm text-zinc-500 hover:underline"
          >
            ← Detalle del proyecto
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{project.name}</h1>
        </div>
      </div>

      <BoardClient
        projectId={projectId}
        columns={columns.map((c) => ({
          id: c._id.toString(),
          name: c.name,
          color: c.color,
          order: c.order,
        }))}
        tasks={tasks.map((t) => ({
          id: t._id.toString(),
          title: t.title,
          description: t.description,
          column_id: t.column_id.toString(),
          assignee_id: t.assignee_id.toString(),
          priority: t.priority,
          order: t.order,
          due_date: t.due_date ? t.due_date.toISOString() : null,
        }))}
        members={members.map((m) => ({
          id: m._id.toString(),
          name: m.name,
          email: m.email,
        }))}
      />
    </div>
  );
}
