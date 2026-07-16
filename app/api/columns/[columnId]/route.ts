import { NextResponse } from "next/server";
import { Int32, ObjectId } from "mongodb";
import {
  columnsCollection,
  commentsCollection,
  tasksCollection,
} from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { getAccessibleProject } from "@/lib/auth/authorize";
import { updateColumnSchema } from "@/lib/validations/column";

async function loadAccessibleColumn(columnId: string, session: NonNullable<Awaited<ReturnType<typeof getSession>>>) {
  const columns = await columnsCollection();
  const column = await columns.findOne({ _id: new ObjectId(columnId) });
  if (!column) return null;
  const project = await getAccessibleProject(column.project_id.toString(), session);
  if (!project) return null;
  return { column, project };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ columnId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { columnId } = await params;
  const found = await loadAccessibleColumn(columnId, session);
  if (!found) return NextResponse.json({ error: "Columna no encontrada" }, { status: 404 });

  const parsed = updateColumnSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { order, ...rest } = parsed.data;
  const set: Record<string, unknown> = { ...rest };
  if (order !== undefined) set.order = new Int32(order);
  await (await columnsCollection()).updateOne(
    { _id: found.column._id },
    { $set: set as never }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ columnId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { columnId } = await params;
  const found = await loadAccessibleColumn(columnId, session);
  if (!found) return NextResponse.json({ error: "Columna no encontrada" }, { status: 404 });

  const tasks = await tasksCollection();
  const taskIds = (
    await tasks.find({ column_id: found.column._id }, { projection: { _id: 1 } }).toArray()
  ).map((t) => t._id);

  if (taskIds.length > 0) {
    await (await commentsCollection()).deleteMany({ task_id: { $in: taskIds } });
    await tasks.deleteMany({ _id: { $in: taskIds } });
  }
  await (await columnsCollection()).deleteOne({ _id: found.column._id });

  return NextResponse.json({ ok: true });
}
