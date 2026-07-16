import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { commentsCollection, usersCollection } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { getAccessibleTask } from "@/lib/auth/authorize";
import { createCommentSchema } from "@/lib/validations/comment";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { taskId } = await params;
  const found = await getAccessibleTask(taskId, session);
  if (!found) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });

  const comments = await (await commentsCollection())
    .find({ task_id: found.task._id })
    .sort({ created_at: -1 })
    .toArray();

  const userIds = Array.from(new Set(comments.map((c) => c.user_id.toString()))).map(
    (id) => new ObjectId(id)
  );
  const users = userIds.length
    ? await (await usersCollection())
        .find({ _id: { $in: userIds } }, { projection: { name: 1 } })
        .toArray()
    : [];
  const nameById = new Map(users.map((u) => [u._id.toString(), u.name]));

  return NextResponse.json(
    comments.map((c) => ({
      _id: c._id.toString(),
      text: c.text,
      created_at: c.created_at,
      user_id: c.user_id.toString(),
      user_name: nameById.get(c.user_id.toString()) ?? "Usuario",
    }))
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { taskId } = await params;
  const found = await getAccessibleTask(taskId, session);
  if (!found) return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });

  const parsed = createCommentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const _id = new ObjectId();
  await (await commentsCollection()).insertOne({
    _id,
    task_id: found.task._id,
    user_id: new ObjectId(session.sub),
    text: parsed.data.text,
    created_at: new Date(),
  });

  return NextResponse.json({ id: _id.toString() }, { status: 201 });
}
