"use client";

import { Swiper, SwiperSlide, SwiperRef, SwiperClass } from "swiper/react";
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
  ChatCircle,
  ClockClockwise,
  Pencil,
  SpinnerGap,
  Trash,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "react-toastify";

type TasksListProps = Pick<Exclude<CustomerWithTasks, null>, "tasks">;
type Task = TasksListProps["tasks"][number];

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { getMediaURL } from "@/lib/aws";
import { Comments } from "./Comments";

export function TasksList({ tasks: _tasks }: TasksListProps) {
  const session = useSession();

  const [tasks, setTasks] = useState(_tasks);

  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(
    null
  );

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCommentOpened, setIsCommentOpened] = useState(false);

  const toggleCheckTask = async (selectedTask: Task) => {
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
    const params = new URLSearchParams(searchParams.toString());
    params.set("id", id);
    router.replace(`${pathname}?${params.toString()}`);
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

  const openComments = (task: Task) => {
    setSelectedTask(task);
    setIsCommentOpened(true);
  };

  return (
    <>
      <ul className="flex flex-col gap-6  ">
        {tasks.map((task) => {
          const isArchived = task.archivedAt !== null;
          const isChecked = task.completedAt !== null;
          const isLate = isBefore(task.due, new Date());
          const variantByResponsible =
            task.responsible === TaskResponsible.AGENCY
              ? "primary"
              : "secondary";

          return (
            <li
              key={task.id}
              className={cn(
                "relative p-6 bg-white rounded-2xl drop-shadow-custom"
              )}
              style={{ wordWrap: "break-word" }}
            >
              <div
                className={cn("flex flex-col gap-3", {
                  "opacity-50": isArchived,
                  "opacity-80": isChecked,
                })}
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
                        {format(task.due, "dd 'de' MMM, HH:mm", {
                          locale: ptBR,
                        })}
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
                      <>
                        <button
                          type="button"
                          className={cn(
                            "flex items-center justify-center w-7 h-7 rounded-full disabled:cursor-not-allowed",
                            {
                              "bg-border text-text": !isChecked,
                              "bg-green-600 text-white": isChecked,
                            }
                          )}
                          title={
                            isChecked
                              ? "Remover aprovação"
                              : "Marcar como aprovada"
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

                        <button
                          type="button"
                          className={cn(
                            "relative flex items-center justify-center w-7 h-7  text-primary rounded-full disabled:cursor-not-allowed"
                          )}
                          title={
                            isChecked
                              ? "Marcar como pendente"
                              : "Marcar como finalizada"
                          }
                          onClick={() => openComments(task)}
                        >
                          <span className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-white font-semibold text-xs leading-[1]">
                            {task._count.comments > 9
                              ? "9+"
                              : task._count.comments}
                          </span>
                          <ChatCircle size={28} weight="fill" />
                        </button>
                      </>
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

                <h2 className={cn("font-bold text-xl")}>{task.title}</h2>

                <p className={cn("text-sm")}>{task.description}</p>

                {task.medias.length > 0 ? (
                  <>
                    <Swiper
                      onSwiper={setSwiperInstance}
                      autoHeight
                      modules={[Pagination]}
                      className="w-full"
                      slidesPerView={1}
                      pagination={{
                        el: `.swiperPagination-${task.id}`,
                        clickable: true,
                        bulletClass:
                          "block w-2 h-2 rounded-full bg-black/25 cursor-pointer",
                        bulletActiveClass: "!bg-secondary",
                      }}
                      observer
                      observeParents
                    >
                      {task.medias.map(({ id, type, path }, index) => (
                        <SwiperSlide key={id}>
                          {type.startsWith("video") ? (
                            <video
                              className="max-w-full object-cover mx-auto select-none"
                              controls
                              onLoadedData={() => {
                                if (index > 0) {
                                  return;
                                }

                                setTimeout(() => {
                                  swiperInstance?.updateAutoHeight();
                                }, 1000);
                              }}
                            >
                              <source src={getMediaURL(path)} />
                            </video>
                          ) : (
                            <img
                              className="max-w-full object-cover mx-auto select-none"
                              src={getMediaURL(path)}
                              alt=""
                            />
                          )}
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <div
                      className={cn(
                        `swiperPagination-${task.id}`,
                        "flex gap-2 justify-center mt-4"
                      )}
                    ></div>
                  </>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <Comments
        taskId={selectedTask?.id || ""}
        isOpened={isCommentOpened}
        onClose={() => setIsCommentOpened(false)}
      />
    </>
  );
}
