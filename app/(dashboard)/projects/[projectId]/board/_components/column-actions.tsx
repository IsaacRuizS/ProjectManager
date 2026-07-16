"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ColumnActions({
  columnId,
  currentName,
}: {
  columnId: string;
  currentName: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [busy, setBusy] = useState(false);

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name === currentName) {
      setEditing(false);
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/columns/${columnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setBusy(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "¿Eliminar esta columna? Se eliminarán también todas sus tareas y comentarios."
      )
    )
      return;
    setBusy(true);
    const res = await fetch(`/api/columns/${columnId}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  if (editing) {
    return (
      <form onSubmit={handleRename} className="ml-2 flex flex-1 items-center gap-1">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-w-0 flex-1 rounded border border-zinc-300 bg-transparent px-1 py-0.5 text-sm dark:border-zinc-700"
        />
        <button
          type="submit"
          disabled={busy}
          className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
        >
          ✓
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setName(currentName);
          }}
          className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          ✕
        </button>
      </form>
    );
  }

  return (
    <div className="ml-auto flex items-center gap-1 text-xs text-zinc-400">
      <button
        onClick={() => setEditing(true)}
        title="Renombrar"
        className="hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        ✎
      </button>
      <button
        onClick={handleDelete}
        disabled={busy}
        title="Eliminar columna"
        className="hover:text-red-600 disabled:opacity-50"
      >
        🗑
      </button>
    </div>
  );
}
