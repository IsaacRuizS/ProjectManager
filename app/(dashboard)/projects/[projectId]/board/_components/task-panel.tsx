"use client";

import { useEffect, useState } from "react";
import type { TaskDTO, MemberDTO } from "./board";

interface CommentDTO {
  _id: string;
  text: string;
  created_at: string;
  user_id: string;
  user_name: string;
}

interface TaskPanelProps {
  task: TaskDTO;
  members: MemberDTO[];
  onClose: () => void;
  onUpdated: () => void;
  onDeleted: () => void;
}

export function TaskPanel({ task, members, onClose, onUpdated, onDeleted }: TaskPanelProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [assigneeId, setAssigneeId] = useState(task.assignee_id);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.due_date ? task.due_date.slice(0, 10) : "");
  const [savingTask, setSavingTask] = useState(false);

  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoadingComments(true);
    fetch(`/api/tasks/${task.id}/comments`)
      .then((r) => r.json())
      .then((data) => {
        if (!ignore) setComments(Array.isArray(data) ? data : []);
      })
      .finally(() => {
        if (!ignore) setLoadingComments(false);
      });
    return () => {
      ignore = true;
    };
  }, [task.id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavingTask(true);
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        assignee_id: assigneeId,
        priority,
        due_date: dueDate || undefined,
      }),
    });
    setSavingTask(false);
    if (res.ok) onUpdated();
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar la tarea?")) return;
    const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    if (res.ok) onDeleted();
  }

  async function handlePostComment(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPostingComment(true);
    const res = await fetch(`/api/tasks/${task.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newComment }),
    });
    setPostingComment(false);
    if (res.ok) {
      setNewComment("");
      const refreshed = await fetch(`/api/tasks/${task.id}/comments`).then((r) => r.json());
      setComments(Array.isArray(refreshed) ? refreshed : []);
    }
  }

  async function handleDeleteComment(id: string) {
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) setComments((prev) => prev.filter((c) => c._id !== id));
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-6 shadow-xl dark:bg-zinc-950"
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">Detalle de tarea</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-3">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
                Asignado
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
              Fecha límite
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={savingTask}
              className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
            >
              {savingTask ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500"
            >
              Eliminar
            </button>
          </div>
        </form>

        <hr className="my-6 border-zinc-200 dark:border-zinc-800" />

        <section>
          <h3 className="font-medium">Comentarios</h3>
          {loadingComments ? (
            <p className="mt-3 text-sm text-zinc-500">Cargando…</p>
          ) : comments.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Sin comentarios aún.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {comments.map((c) => (
                <li
                  key={c._id}
                  className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{c.user_name}</span>
                    <span>{new Date(c.created_at).toLocaleString()}</span>
                  </div>
                  <p className="mt-1">{c.text}</p>
                  <button
                    onClick={() => handleDeleteComment(c._id)}
                    className="mt-2 text-xs text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={handlePostComment} className="mt-4 space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              placeholder="Escribí un comentario…"
              className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1 text-sm dark:border-zinc-700"
            />
            <button
              type="submit"
              disabled={postingComment || !newComment.trim()}
              className="rounded bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
            >
              {postingComment ? "Publicando…" : "Comentar"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
