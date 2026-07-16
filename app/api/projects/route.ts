import { NextResponse } from "next/server";
import { Int32, ObjectId } from "mongodb";
import { columnsCollection, projectsCollection } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { createProjectSchema } from "@/lib/validations/project";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const userId = new ObjectId(session.sub);
  const projects = await (await projectsCollection())
    .find({ $or: [{ owner_id: userId }, { members: userId }] })
    .sort({ due_date: 1 })
    .toArray();

  return NextResponse.json(projects);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { name, description, start_date, due_date, members } = parsed.data;
  const ownerId = new ObjectId(session.sub);
  const _id = new ObjectId();

  await (await projectsCollection()).insertOne({
    _id,
    name,
    description,
    owner_id: ownerId,
    members: members.map((id) => new ObjectId(id)),
    start_date,
    due_date,
    status: "active",
  });

  const defaultColumns = [
    { name: "Por hacer", color: "#94A3B8" },
    { name: "En progreso", color: "#3B82F6" },
    { name: "En revisión", color: "#F59E0B" },
    { name: "Terminado", color: "#22C55E" },
  ];
  await (await columnsCollection()).insertMany(
    defaultColumns.map((c, order) => ({
      _id: new ObjectId(),
      name: c.name,
      color: c.color,
      order: new Int32(order) as unknown as number,
      project_id: _id,
    }))
  );

  return NextResponse.json({ id: _id.toString() }, { status: 201 });
}
