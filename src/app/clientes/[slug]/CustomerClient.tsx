"use client";

import Link from "next/link";
import { useSearchParamsContext } from "@/contexts/SearchParamsProvider";
import { api } from "@/lib/api";
import { TaskListItem } from "@/services/tasks";
import { useCallback, useEffect, useRef, useState } from "react";
import { TaskForm } from "./TaskForm";
import { TasksList } from "./TasksLists";

type CustomerClientProps = {
  customerId: string;
  customerSlug: string;
  initialTasks: TaskListItem[];
  initialHasMore: boolean;
  showTaskForm: boolean;
};

export function CustomerClient({
  customerId,
  customerSlug,
  initialTasks,
  initialHasMore,
  showTaskForm,
}: CustomerClientProps) {
  const { searchParams, setSearchParams } = useSearchParamsContext();
  const formSectionRef = useRef<HTMLDivElement>(null);

  const editingTaskId = searchParams.id ?? null;

  const [tasks, setTasks] = useState(initialTasks);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);

  const handleEditTask = useCallback(
    (taskId: string) => {
      setSearchParams({ id: taskId }, { noRedirect: true });
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (!editingTaskId || !showTaskForm) return;

    formSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [editingTaskId, showTaskForm]);

  const handleCloseEdit = useCallback(() => {
    setSearchParams(
      { id: null },
      { noRedirect: true, historyMethod: "replace" },
    );
  }, [setSearchParams]);

  const handleRefreshFirstPage = useCallback(async () => {
    const { data } = await api.get<{
      tasks: TaskListItem[];
      pagination: { page: number; hasMore: boolean };
    }>(`customers/${customerId}/tasks`, {
      params: { page: 1 },
    });

    setTasks(data.tasks);
    setPage(data.pagination.page);
    setHasMore(data.pagination.hasMore);
  }, [customerId]);

  const handleUpdateTask = useCallback(
    (taskId: string, data: Partial<TaskListItem>) => {
      setTasks((prevState) =>
        prevState.map((task) =>
          task.id === taskId ? { ...task, ...data } : task,
        ),
      );
    },
    [],
  );

  return (
    <>
      {showTaskForm ? (
        <div ref={formSectionRef} id="task-form" className="scroll-mt-6">
          <TaskForm
            customerId={customerId}
            editingTaskId={editingTaskId}
            onCloseEdit={handleCloseEdit}
            onTaskCreated={handleRefreshFirstPage}
            onTaskUpdated={handleUpdateTask}
          />
        </div>
      ) : null}

      <Link
        href={`/clientes/${customerSlug}/calendario`}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-transparent text-secondary border border-secondary font-medium rounded-full hover:opacity-90 transition-opacity"
      >
        Ver calendário
      </Link>

      {tasks.length > 0 ? (
        <TasksList
          tasks={tasks}
          setTasks={setTasks}
          page={page}
          setPage={setPage}
          hasMore={hasMore}
          setHasMore={setHasMore}
          customerId={customerId}
          onEditTask={handleEditTask}
        />
      ) : null}
    </>
  );
}
