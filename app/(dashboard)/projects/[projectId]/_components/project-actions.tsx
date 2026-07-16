"use client";

import { useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type { ProjectStatus } from "@/types";
import { PROJECT_STATUS_LABEL, PROJECT_STATUS_OPTIONS } from "@/lib/i18n/labels";

interface ProjectActionsProps {
  projectId: string;
  isOwner: boolean;
  initialName: string;
  initialDescription: string;
  initialStatus: ProjectStatus;
}

export function ProjectActions({
  projectId,
  isOwner,
  initialName,
  initialDescription,
  initialStatus,
}: ProjectActionsProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (!isOwner) return null;

  async function handleUpdate(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
        status: formData.get("status"),
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo actualizar el proyecto");
      return;
    }

    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer.")) return;

    const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo eliminar el proyecto");
      return;
    }

    router.push("/projects");
    router.refresh();
  }

  return (
    <Card className="space-y-4">
      <h2 className="text-sm font-medium">Editar proyecto</h2>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre</Label>
          <Input id="name" name="name" defaultValue={initialName} required />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Input id="description" name="description" defaultValue={initialDescription} />
        </div>
        <div>
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            name="status"
            defaultValue={initialStatus}
            className="w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400"
          >
            {PROJECT_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {PROJECT_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit">Guardar cambios</Button>
          <Button type="button" variant="danger" onClick={handleDelete}>
            Eliminar proyecto
          </Button>
        </div>
      </form>
    </Card>
  );
}
