"use client";

import { useState } from "react";
import { TASK_PRIORITY_LABEL } from "@/lib/i18n/labels";

interface Result {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  due_date: string | null;
  project_name: string;
  assignee_name: string;
}

export function SearchClient() {
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState("");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (priority) params.set("priority", priority);
    if (dueFrom) params.set("due_from", dueFrom);
    if (dueTo) params.set("due_to", dueTo);

    const res = await fetch(`/api/tasks/search?${params.toString()}`);
    const data = await res.json();
    setResults(Array.isArray(data) ? data : []);
    setLoading(false);
    setSearched(true);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="grid gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Texto
          </label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="mockup, API, bug…"
            className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Prioridad
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
          >
            <option value="">Todas</option>
            <option value="low">{TASK_PRIORITY_LABEL.low}</option>
            <option value="medium">{TASK_PRIORITY_LABEL.medium}</option>
            <option value="high">{TASK_PRIORITY_LABEL.high}</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Vence desde
          </label>
          <input
            type="date"
            value={dueFrom}
            onChange={(e) => setDueFrom(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-wide text-zinc-500">
            Vence hasta
          </label>
          <input
            type="date"
            value={dueTo}
            onChange={(e) => setDueTo(e.target.value)}
            className="w-full rounded border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            {loading ? "Buscando…" : "Buscar"}
          </button>
        </div>
      </form>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
        {searched && results.length === 0 && !loading ? (
          <p className="p-6 text-sm text-zinc-600 dark:text-zinc-400">
            No se encontraron tareas con esos criterios.
          </p>
        ) : results.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-2 text-left">Tarea</th>
                <th className="px-4 py-2 text-left">Proyecto</th>
                <th className="px-4 py-2 text-left">Asignado</th>
                <th className="px-4 py-2 text-left">Prioridad</th>
                <th className="px-4 py-2 text-left">Vence</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-900">
                  <td className="px-4 py-2">
                    <div className="font-medium">{r.title}</div>
                    {r.description && (
                      <div className="text-xs text-zinc-500">{r.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-2">{r.project_name}</td>
                  <td className="px-4 py-2">{r.assignee_name}</td>
                  <td className="px-4 py-2">{TASK_PRIORITY_LABEL[r.priority]}</td>
                  <td className="px-4 py-2">
                    {r.due_date ? new Date(r.due_date).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-6 text-sm text-zinc-500">
            Ingresá algún criterio y presioná Buscar.
          </p>
        )}
      </div>
    </div>
  );
}
