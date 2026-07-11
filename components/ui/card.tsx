import type { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-zinc-200 p-6 dark:border-zinc-800 ${className}`}
      {...props}
    />
  );
}
