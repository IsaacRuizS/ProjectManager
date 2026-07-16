import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import {
  columnsCollection,
  commentsCollection,
  projectsCollection,
  tasksCollection,
} from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { getAccessibleProject } from "@/lib/auth/authorize";
import { updateProjectSchema } from "@/lib/validations/project";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { projectId } = await params;
  const project = await getAccessibleProject(projectId, session);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  return NextResponse.json(project);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { projectId } = await params;
  const project = await getAccessibleProject(projectId, session);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  const body = await request.json();
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { members, ...rest } = parsed.data;
  await (await projectsCollection()).updateOne(
    { _id: project._id },
    {
      $set: {
        ...rest,
        ...(members ? { members: members.map((id) => new ObjectId(id)) } : {}),
      },
    }
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { projectId } = await params;
  const project = await getAccessibleProject(projectId, session);
  if (!project) return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });

  if (project.owner_id.toString() !== session.sub) {
    return NextResponse.json(
      { error: "Solo el propietario puede eliminar el proyecto" },
      { status: 403 }
    );
  }

  const tasks = await tasksCollection();
  const taskIds = (
    await tasks.find({ project_id: project._id }, { projection: { _id: 1 } }).toArray()
  ).map((t) => t._id);

  if (taskIds.length > 0) {
    await (await commentsCollection()).deleteMany({ task_id: { $in: taskIds } });
  }
  await tasks.deleteMany({ project_id: project._id });
  await (await columnsCollection()).deleteMany({ project_id: project._id });
  await (await projectsCollection()).deleteOne({ _id: project._id });

  return NextResponse.json({ ok: true });
}
