"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { TASK_PRIORITY_LABEL } from "@/lib/i18n/labels";
import { NewTaskForm } from "./new-task-form";
import { TaskPanel } from "./task-panel";
import { ColumnActions } from "./column-actions";
import { NewColumnButton } from "./new-column-button";

export interface ColumnDTO {
  id: string;
  name: string;
  color?: string;
  order: number;
}

export interface TaskDTO {
  id: string;
  title: string;
  description?: string;
  column_id: string;
  assignee_id: string;
  priority: "low" | "medium" | "high";
  order: number;
  due_date: string | null;
}

export interface MemberDTO {
  id: string;
  name: string;
  email: string;
}

interface BoardProps {
  projectId: string;
  columns: ColumnDTO[];
  tasks: TaskDTO[];
  members: MemberDTO[];
}

const priorityStyles: Record<TaskDTO["priority"], string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  high: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
};

export function Board({ projectId, columns, tasks: initialTasks, members }: BoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const tasksByColumn = useMemo(() => {
    const map = new Map<string, TaskDTO[]>();
    for (const col of columns) map.set(col.id, []);
    for (const t of tasks) {
      const list = map.get(t.column_id);
      if (list) list.push(t);
    }
    for (const list of map.values()) list.sort((a, b) => a.order - b.order);
    return map;
  }, [tasks, columns]);

  const memberById = useMemo(
    () => new Map(members.map((m) => [m.id, m])),
    [members]
  );

  async function handleDragEnd(event: DragEndEvent) {
    const taskId = event.active.id as string;
    const targetColumnId = event.over?.id as string | undefined;
    if (!targetColumnId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.column_id === targetColumnId) return;

    const list = tasksByColumn.get(targetColumnId) ?? [];
    const nextOrder = list.length;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, column_id: targetColumnId, order: nextOrder } : t
      )
    );

    const res = await fetch(`/api/tasks/${taskId}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ column_id: targetColumnId, order: nextOrder }),
    });

    if (!res.ok) {
      setTasks(initialTasks);
    } else {
      router.refresh();
    }
  }

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) ?? null : null;

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <BoardColumn
              key={col.id}
              column={col}
              tasks={tasksByColumn.get(col.id) ?? []}
              members={memberById}
              onSelectTask={setSelectedTaskId}
              projectId={projectId}
              allMembers={members}
            />
          ))}
          <NewColumnButton projectId={projectId} />
        </div>
      </DndContext>

      {selectedTask && (
        <TaskPanel
          key={selectedTask.id}
          task={selectedTask}
          members={members}
          onClose={() => setSelectedTaskId(null)}
          onUpdated={() => router.refresh()}
          onDeleted={() => {
            setSelectedTaskId(null);
            router.refresh();
          }}
        />
      )}
    </>
  );

  function BoardColumn({
    column,
    tasks,
    members,
    onSelectTask,
    projectId,
    allMembers,
  }: {
    column: ColumnDTO;
    tasks: TaskDTO[];
    members: Map<string, MemberDTO>;
    onSelectTask: (id: string) => void;
    projectId: string;
    allMembers: MemberDTO[];
  }) {
    const { setNodeRef, isOver } = useDroppable({ id: column.id });

    return (
      <div
        ref={setNodeRef}
        className={`flex w-72 shrink-0 flex-col rounded-lg border border-zinc-200 bg-zinc-100/50 p-3 dark:border-zinc-800 dark:bg-zinc-900/50 ${
          isOver ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <div className="mb-3 flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: column.color ?? "#94A3B8" }}
          />
          <h3 className="min-w-0 truncate font-medium">{column.name}</h3>
          <span className="text-xs text-zinc-500">{tasks.length}</span>
          <ColumnActions columnId={column.id} currentName={column.name} />
        </div>

        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <DraggableCard
              key={task.id}
              task={task}
              member={members.get(task.assignee_id)}
              onSelect={onSelectTask}
            />
          ))}
        </div>

        <div className="mt-3">
          <NewTaskForm
            projectId={projectId}
            columnId={column.id}
            members={allMembers}
          />
        </div>
      </div>
    );
  }

  function DraggableCard({
    task,
    member,
    onSelect,
  }: {
    task: TaskDTO;
    member: MemberDTO | undefined;
    onSelect: (id: string) => void;
  }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: task.id,
    });

    const style = transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`rounded-md border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => onSelect(task.id)}
            className="flex-1 text-left text-sm font-medium hover:underline"
          >
            {task.title}
          </button>
          <button
            type="button"
            className="cursor-grab text-zinc-400 hover:text-zinc-600"
            {...listeners}
            {...attributes}
            aria-label="Arrastrar"
          >
            ⋮⋮
          </button>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${priorityStyles[task.priority]}`}
          >
            {TASK_PRIORITY_LABEL[task.priority]}
          </span>
          {member && (
            <span className="text-xs text-zinc-500">{member.name}</span>
          )}
          {task.due_date && (
            <span className="ml-auto text-[10px] text-zinc-500">
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    );
  }
}
