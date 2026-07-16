import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { commentsCollection } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ commentId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { commentId } = await params;
  const comments = await commentsCollection();
  const comment = await comments.findOne({ _id: new ObjectId(commentId) });
  if (!comment) return NextResponse.json({ error: "Comentario no encontrado" }, { status: 404 });

  if (comment.user_id.toString() !== session.sub) {
    return NextResponse.json({ error: "No puedes eliminar este comentario" }, { status: 403 });
  }

  await comments.deleteOne({ _id: comment._id });
  return NextResponse.json({ ok: true });
}
