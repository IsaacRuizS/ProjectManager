import { NextResponse } from "next/server";
import { Int32, ObjectId } from "mongodb";
import { columnsCollection, tasksCollection } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { getAccessibleTask } from "@/lib/auth/authorize";
import { moveTaskSchema } from "@/lib/validations/task";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { taskId } = await params;
  const found = await getAccessibleTask(taskId, session);
  if (!found) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });

  const parsed = moveTaskSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { column_id, order } = parsed.data;

  const targetColumn = await (await columnsCollection()).findOne({
    _id: new ObjectId(column_id),
    project_id: found.project._id,
  });
  if (!targetColumn) {
    return NextResponse.json({ error: "Columna inválida" }, { status: 400 });
  }

  await (await tasksCollection()).updateOne(
    { _id: found.task._id },
    { $set: { column_id: targetColumn._id, order: new Int32(order) as unknown as number } }
  );

  return NextResponse.json({ ok: true });
}
