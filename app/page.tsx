import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

async function getStatus() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    const collections = (await db.listCollections().toArray()).map((c) => c.name);
    return { ok: true as const, db: db.databaseName, collections };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Error desconocido",
    };
  }
}

export default async function Home() {
  const status = await getStatus();

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">
          Gestor de Proyectos
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Next.js + MongoDB Atlas — Práctica No. 4 (SC-609).
        </p>

        <section className="mt-10 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h2 className="text-lg font-medium">Estado de la conexión</h2>
          {status.ok ? (
            <div className="mt-3 space-y-2 text-sm">
              <p>
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-2" />
                Conectado a <code>{status.db}</code>
              </p>
              <p className="text-zinc-600 dark:text-zinc-400">
                Colecciones:{" "}
                {status.collections.length > 0
                  ? status.collections.join(", ")
                  : "(sin colecciones — ejecutá el seed)"}
              </p>
            </div>
          ) : (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400">
              <p>
                <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-2" />
                No se pudo conectar.
              </p>
              <pre className="mt-2 whitespace-pre-wrap text-xs">
                {status.error}
              </pre>
            </div>
          )}
        </section>

        <section className="mt-8 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            Endpoint de diagnóstico:{" "}
            <a
              className="underline"
              href="/api/health"
              target="_blank"
              rel="noreferrer"
            >
              /api/health
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
