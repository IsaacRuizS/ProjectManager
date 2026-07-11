import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const ping = await db.command({ ping: 1 });
    const collections = (await db.listCollections().toArray()).map((c) => c.name);
    return NextResponse.json({
      ok: ping.ok === 1,
      db: db.databaseName,
      collections,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
