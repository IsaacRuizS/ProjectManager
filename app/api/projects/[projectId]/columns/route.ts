import { NextResponse } from "next/server";
import { Int32, ObjectId } from "mongodb";
import { columnsCollection } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { getAccessibleProject } from "@/lib/auth/authorize";
import { createColumnSchema } from "@/lib/validations/column";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { projectId } = await params;
  const project = await getAccessibleProject(projectId, session);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  const columns = await (await columnsCollection())
    .find({ project_id: project._id })
    .sort({ order: 1 })
    .toArray();

  return NextResponse.json(columns);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { projectId } = await params;
  const project = await getAccessibleProject(projectId, session);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  const parsed = createColumnSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const columns = await columnsCollection();
  const last = await columns
    .find({ project_id: project._id })
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  const nextOrder = last[0] ? last[0].order + 1 : 0;

  const _id = new ObjectId();
  const doc: Record<string, unknown> = {
    _id,
    name: parsed.data.name,
    order: new Int32(nextOrder),
    project_id: project._id,
  };
  if (parsed.data.color) doc.color = parsed.data.color;
  await columns.insertOne(doc as never);

  return NextResponse.json({ id: _id.toString() }, { status: 201 });
}
