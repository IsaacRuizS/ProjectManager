import { ObjectId } from "mongodb";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projectsCollection } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { PROJECT_STATUS_LABEL } from "@/lib/i18n/labels";
import { ProjectActions } from "./_components/project-actions";

export default async function ProjectDetailPage({
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

  const isOwner = project.owner_id.toString() === session!.sub;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
            {PROJECT_STATUS_LABEL[project.status]}
          </p>
        </div>
        <Link
          href={`/projects/${projectId}/board`}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Abrir tablero
        </Link>
      </div>

      <Card className="space-y-4">
        {project.description && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
        )}
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-zinc-500">Inicio</dt>
            <dd>{new Date(project.start_date).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-zinc-500">Entrega</dt>
            <dd>{new Date(project.due_date).toLocaleDateString()}</dd>
          </div>
        </dl>
      </Card>

      <ProjectActions
        projectId={projectId}
        isOwner={isOwner}
        initialName={project.name}
        initialDescription={project.description ?? ""}
        initialStatus={project.status}
      />
    </div>
  );
}
