"use client";

import { Swiper, SwiperSlide, SwiperClass } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Pill } from "@/components/Pill";
import { cn } from "@/utils/cn";
import { TaskResponsible, UserRole } from "@prisma/client";
import { format, isEqual } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getMediaURL } from "@/lib/aws";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { CalendarBlank } from "@phosphor-icons/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Task = {
  id: string;
  title: string;
  description: string | null;
  due: Date;
  responsible: TaskResponsible;
  archivedAt: Date | null;
  completedAt: Date | null;
  scheduledAt: Date | null;
  ratio: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  medias: Array<{
    id: string;
    path: string;
    type: string;
  }>;
  _count: { comments: number };
  updatedBy: { name: string };
};

type TaskDetailProps = {
  task: Task;
};

export function TaskDetail({ task }: TaskDetailProps) {
  const session = useSession();
  const [swiperInstance, setSwiperInstance] = useState<SwiperClass | null>(
    null,
  );

  const isArchived = task.archivedAt !== null;
  const isChecked = task.completedAt !== null;
  const isScheduled = task.scheduledAt !== null;
  const variantByResponsible =
    task.responsible === TaskResponsible.AGENCY ? "primary" : "secondary";

  return (
    <article
      className={cn(
        "relative bg-white rounded-2xl drop-shadow-custom overflow-hidden",
      )}
      style={{ wordWrap: "break-word" }}
    >
      <div
        className={cn("flex flex-col", {
          "opacity-50": isArchived,
          "opacity-80": isChecked,
        })}
      >
        <div className="flex flex-col gap-3 p-6">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 flex-wrap">
              {isArchived ? <Pill>Arquivada</Pill> : null}

              {session.data?.user.role === UserRole.ADMIN ? (
                <Pill>
                  {(task.updatedAt && !isEqual(task.createdAt, task.updatedAt)
                    ? "Última atualização por: "
                    : "Criado por: "
                  ).concat(task.updatedBy.name)}
                </Pill>
              ) : null}
            </div>

            <div className="flex gap-2 flex-wrap">
              {isChecked || isScheduled ? (
                <Pill variant="primary">
                  {isChecked && !isScheduled ? "Aprovado" : "Agendado"}
                </Pill>
              ) : null}

              <Pill variant={variantByResponsible}>
                <CalendarBlank size={20} weight="bold" />
                {format(task.due, "dd 'de' MMM, HH:mm", { locale: ptBR })}
              </Pill>
            </div>
          </div>

          <h2 className={cn("font-bold text-xl")}>{task.title}</h2>

          {task.description ? (
            <p className={cn("text-sm text-slate-600")}>{task.description}</p>
          ) : null}
        </div>

        {task.medias.length > 0 ? (
          <>
            <Swiper
              onSwiper={setSwiperInstance}
              autoHeight={!task.ratio}
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
              style={
                task.ratio
                  ? { aspectRatio: task.ratio.replace(":", "/") }
                  : undefined
              }
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
                      className="max-w-full h-full object-cover mx-auto select-none"
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
                "flex gap-2 justify-center mt-4 pb-6",
              )}
            ></div>
          </>
        ) : null}
      </div>
    </article>
  );
}
