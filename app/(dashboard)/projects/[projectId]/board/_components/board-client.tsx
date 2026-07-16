"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const Board = dynamic(() => import("./board").then((m) => m.Board), {
  ssr: false,
  loading: () => (
    <div className="text-sm text-zinc-500">Cargando tablero…</div>
  ),
});

export function BoardClient(props: ComponentProps<typeof Board>) {
  return <Board {...props} />;
}
