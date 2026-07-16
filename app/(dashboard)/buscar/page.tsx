import { SearchClient } from "./_components/search-client";

export default function BuscarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Buscar tareas</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Filtro por prioridad, rango de fecha límite y texto en título/descripción.
        </p>
      </div>
      <SearchClient />
    </div>
  );
}
