import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { commentsCollection, tasksCollection } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { getAccessibleTask } from "@/lib/auth/authorize";
import { updateTaskSchema } from "@/lib/validations/task";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { taskId } = await params;
  const found = await getAccessibleTask(taskId, session);
  if (!found) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });

  return NextResponse.json(found.task);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { taskId } = await params;
  const found = await getAccessibleTask(taskId, session);
  if (!found) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });

  const parsed = updateTaskSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { assignee_id, ...rest } = parsed.data;
  await (await tasksCollection()).updateOne(
    { _id: found.task._id },
    {
      $set: {
        ...rest,
        ...(assignee_id ? { assignee_id: new ObjectId(assignee_id) } : {}),
      },
    }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { taskId } = await params;
  const found = await getAccessibleTask(taskId, session);
  if (!found) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });

  await (await commentsCollection()).deleteMany({ task_id: found.task._id });
  await (await tasksCollection()).deleteOne({ _id: found.task._id });

  return NextResponse.json({ ok: true });
}
