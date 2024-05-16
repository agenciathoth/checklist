"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Image from "next/image";
import { Pill } from "@/components/Pill";
import { cn } from "@/utils/cn";
import { TaskResponsible, Tasks, UserRole } from "@prisma/client";
import { useSession } from "next-auth/react";
import { CustomerWithTasks } from "./page";
import { format, isBefore, isEqual, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArchiveBox,
  Check,
  ClockClockwise,
  Pencil,
  SpinnerGap,
  Trash,
} from "@phosphor-icons/react";
import { useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "react-toastify";

type TasksListProps = Pick<Exclude<CustomerWithTasks, null>, "tasks">;

import "swiper/css";
import "swiper/css/pagination";
import { getMediaURL } from "@/lib/aws";

export function TasksList({ tasks: _tasks }: TasksListProps) {
  const session = useSession();

  const [tasks, setTasks] = useState(_tasks);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [selectedTask, setSelectedTask] = useState<
    TasksListProps["tasks"][0] | null
  >(null);
  const [isChecking, setIsChecking] = useState(false);

  const toggleCheckTask = async (selectedTask: TasksListProps["tasks"][0]) => {
    if (!selectedTask) return;
    if (
      session.status !== "authenticated" &&
      selectedTask.responsible === TaskResponsible.AGENCY
    )
      return;

    setSelectedTask(selectedTask);

    const isConfirmed =
      session.data && selectedTask.responsible === TaskResponsible.CUSTOMER
        ? window.confirm(
            "Atenção!\n\nEssa tarefa é de responsabilidade do cliente.\n".concat(
              !selectedTask.completedAt
                ? "Você deseja marcá-la como finalizada?"
                : "Você deseja marcá-la como pendente?"
            )
          )
        : true;
    if (!isConfirmed) return;

    try {
      setIsChecking(true);
      await api.patch(`/tasks/${selectedTask.id}/check`);

      setTasks((prevState) => {
        return prevState.map((task) => {
          if (task.id === selectedTask.id) {
            return {
              ...task,
              completedAt: selectedTask.completedAt ? null : new Date(),
            };
          }

          return task;
        });
      });

      toast.success(
        !selectedTask.completedAt
          ? "Tarefa marcada como finalizada com sucesso!"
          : "Tarefa marcada como pendente com sucesso!"
      );
    } catch (error) {
      console.error(error);
      toast.error(
        !selectedTask.completedAt
          ? "Não foi possível marcar a tarefa como finalizada"
          : "Não foi possível marcar a tarefa como pendente"
      );
    } finally {
      setIsChecking(false);
      setSelectedTask(null);
    }
  };

  const editTask = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("id", id);
    router.replace(pathname.concat("?").concat(params.toString()));
  };

  const toggleArchiveTask = async (id: string, isArchived: boolean) => {
    if (!id) return;
    const isConfirmed = window.confirm(
      !isArchived
        ? "Você deseja arquivar a tarefa?"
        : "Você deseja restaurar a tarefa?"
    );
    if (!isConfirmed) return;

    const promise = async () => {
      try {
        await api.patch(`/tasks/${id}/archive`);

        setTasks((prevState) => {
          return prevState.map((task) => {
            if (task.id === id) {
              return {
                ...task,
                archivedAt: task.archivedAt ? null : new Date(),
              };
            }

            return task;
          });
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    toast.promise(promise, {
      pending: !isArchived ? "Arquivando..." : "Restaurando...",
      success: !isArchived
        ? "Tarefa arquivada com sucesso!"
        : "Tarefa restaurada com sucesso!",
      error: !isArchived
        ? "Não foi possível arquivar a tarefa!"
        : "Não foi possível restaurar a tarefa!",
    });
  };

  const deleteCustomer = async (id: string) => {
    if (!id) return;
    const isConfirmed = window.confirm("Você deseja remover a tarefa?");
    if (!isConfirmed) return;

    const promise = async () => {
      try {
        await api.delete("/tasks/".concat(id));

        setTasks((prevState) => {
          return prevState.filter((task) => {
            return task.id !== id;
          });
        });
      } catch (error) {
        console.error(error);
        throw error;
      }
    };

    toast.promise(promise, {
      pending: "Removendo...",
      success: "Tarefa removida com sucesso!",
      error: "Não foi possível remover a tarefa!",
    });
  };

  return (
    <ul className="flex flex-col gap-6 p-6 bg-white rounded-xl drop-shadow-custom">
      {tasks.map((task) => {
        const isArchived = task.archivedAt !== null;
        const isChecked = task.completedAt !== null;
        const isLate = isBefore(task.due, new Date());
        const variantByResponsible =
          task.responsible === TaskResponsible.AGENCY ? "primary" : "secondary";

        return (
          <li
            key={task.id}
            className={cn(
              "flex flex-col gap-3 pb-5 border-b-2 border-border last:pb-0 last:border-none",
              {
                "opacity-50": isArchived,
                "opacity-80": isChecked,
              }
            )}
            style={{ wordWrap: "break-word" }}
          >
            <div className="flex items-start gap-4 w-full">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex gap-2 flex-wrap">
                  {isArchived ? <Pill>Arquivada</Pill> : null}

                  {session.data?.user.role === UserRole.ADMIN ? (
                    <Pill>
                      {(task.updatedAt &&
                      !isEqual(task.createdAt, task.updatedAt)
                        ? "Última atualização por: "
                        : "Criado por: "
                      ).concat(task.updatedBy.name)}
                    </Pill>
                  ) : null}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {isLate ? <Pill variant="tertiary">Atrasada</Pill> : null}

                  <Pill variant={variantByResponsible}>
                    Prazo:{" "}
                    {format(task.due, "dd 'de' MMM, HH:mm", { locale: ptBR })}
                  </Pill>

                  <Pill variant={variantByResponsible}>
                    {task.responsible === TaskResponsible.AGENCY
                      ? "Thoth"
                      : "Cliente"}
                  </Pill>
                </div>
              </div>

              <div className="flex-shrink-0 flex gap-4">
                {!session || !isArchived ? (
                  <button
                    type="button"
                    className={cn(
                      "flex items-center justify-center w-7 h-7 rounded-full disabled:cursor-not-allowed",
                      {
                        "bg-border text-text": !isChecked,
                        "bg-primary text-white":
                          isChecked &&
                          task.responsible === TaskResponsible.AGENCY,
                        "bg-secondary text-text":
                          isChecked &&
                          task.responsible === TaskResponsible.CUSTOMER,
                      }
                    )}
                    title={
                      isChecked
                        ? "Marcar como pendente"
                        : "Marcar como finalizada"
                    }
                    disabled={
                      (selectedTask === task && isChecking) ||
                      (!session.data &&
                        task.responsible === TaskResponsible.AGENCY)
                    }
                    onClick={() => toggleCheckTask(task)}
                  >
                    {selectedTask === task && isChecking ? (
                      <SpinnerGap
                        size={16}
                        weight="bold"
                        className="animate-spin"
                      />
                    ) : isChecked ? (
                      <Check size={16} weight="bold" />
                    ) : null}
                  </button>
                ) : null}

                {session.data ? (
                  !isArchived ? (
                    <>
                      <button
                        type="button"
                        className="flex items-center justify-center w-7 h-7 bg-secondary text-white rounded-full"
                        onClick={() => editTask(task.id)}
                      >
                        <Pencil size={16} weight="bold" />
                      </button>

                      <button
                        type="button"
                        title="Arquivar"
                        className="flex items-center justify-center w-7 h-7 bg-shape-text text-text rounded-full"
                        onClick={() => toggleArchiveTask(task.id, false)}
                      >
                        <ArchiveBox size={16} weight="bold" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        title="Restaurar"
                        className="flex items-center justify-center w-7 h-7 bg-shape-text text-text rounded-full"
                        onClick={() => toggleArchiveTask(task.id, true)}
                      >
                        <ClockClockwise size={16} weight="bold" />
                      </button>

                      <button
                        type="button"
                        className="flex items-center justify-center w-7 h-7 bg-tertiary text-white rounded-full"
                        onClick={() => deleteCustomer(task.id)}
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    </>
                  )
                ) : null}
              </div>
            </div>

            <h2
              className={cn("font-bold text-xl", {
                "line-through": isChecked,
              })}
            >
              {task.title}
            </h2>

            <p className={cn("text-sm", { "line-through": isChecked })}>
              {task.description}
            </p>

            {task.medias.length > 0 ? (
              <>
                <Swiper
                  autoHeight
                  modules={[Pagination]}
                  className="w-full"
                  slidesPerView={1}
                  pagination={{
                    el: ".swiperPagination",
                    clickable: true,
                    bulletClass:
                      "block w-2 h-2 rounded-full bg-black/25 cursor-pointer",
                    bulletActiveClass: "!bg-secondary",
                  }}
                >
                  {task.medias.map((media) => (
                    <SwiperSlide key={media.id}>
                      <img
                        className="max-w-full object-cover mx-auto select-none"
                        src={getMediaURL(media.path)}
                        alt=""
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="swiperPagination flex gap-2 justify-center mt-4"></div>
              </>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
