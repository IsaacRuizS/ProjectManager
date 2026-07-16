import Link from "next/link";
import { ObjectId } from "mongodb";
import { projectsCollection } from "@/lib/db/collections";
import { getSession } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { PROJECT_STATUS_LABEL } from "@/lib/i18n/labels";
import { NewProjectForm } from "./_components/new-project-form";

export default async function ProjectsPage() {
  const session = await getSession();
  const userId = new ObjectId(session!.sub);

  const projects = await (await projectsCollection())
    .find({ $or: [{ owner_id: userId }, { members: userId }] })
    .sort({ due_date: 1 })
    .toArray();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis proyectos</h1>
      </div>

      <NewProjectForm />

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <Link key={project._id.toString()} href={`/projects/${project._id.toString()}`}>
            <Card className="h-full transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
              <h2 className="font-medium">{project.name}</h2>
              {project.description && (
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{project.description}</p>
              )}
              <p className="mt-3 text-xs uppercase tracking-wide text-zinc-500">
                {PROJECT_STATUS_LABEL[project.status]}
              </p>
            </Card>
          </Link>
        ))}
        {projects.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No hay proyectos registrados por el momento.</p>
        )}
      </div>
    </div>
  );
}
