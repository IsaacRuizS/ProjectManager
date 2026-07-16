import { NextResponse } from "next/server";
import { Int32, ObjectId } from "mongodb";
import { columnsCollection, tasksCollection } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { getAccessibleProject } from "@/lib/auth/authorize";
import { createTaskSchema } from "@/lib/validations/task";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const parsed = createTaskSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { project_id, column_id, assignee_id, title, description, priority, due_date } =
    parsed.data;

  const project = await getAccessibleProject(project_id, session);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  const column = await (await columnsCollection()).findOne({
    _id: new ObjectId(column_id),
    project_id: project._id,
  });
  if (!column) return NextResponse.json({ error: "Columna inválida" }, { status: 400 });

  const tasks = await tasksCollection();
  const last = await tasks
    .find({ column_id: column._id })
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  const nextOrder = last[0] ? last[0].order + 1 : 0;

  const _id = new ObjectId();
  const doc: Record<string, unknown> = {
    _id,
    title,
    project_id: project._id,
    column_id: column._id,
    assignee_id: new ObjectId(assignee_id),
    priority,
    order: new Int32(nextOrder),
    created_at: new Date(),
  };
  if (description) doc.description = description;
  if (due_date) doc.due_date = due_date;
  await tasks.insertOne(doc as never);

  return NextResponse.json({ id: _id.toString() }, { status: 201 });
}
