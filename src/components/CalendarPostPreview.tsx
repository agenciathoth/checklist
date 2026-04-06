"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Image as ImageIcon, Play } from "@phosphor-icons/react";
import { getMediaURL } from "@/lib/aws";
import type { MonthTasks } from "@/app/clientes/[slug]/calendario/page";

export type CalendarPreviewTask = NonNullable<MonthTasks>["tasks"][number];

type CalendarPostPreviewProps = {
  task: CalendarPreviewTask;
  slug: string;
  anchorRect: DOMRect;
  onRequestClose: () => void;
  onPreviewMouseEnter: () => void;
  onPreviewMouseLeave: () => void;
};

export function CalendarPostPreview({
  task,
  slug,
  anchorRect,
  onRequestClose,
  onPreviewMouseEnter,
  onPreviewMouseLeave,
}: CalendarPostPreviewProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onRequestCloseRef = useRef(onRequestClose);
  onRequestCloseRef.current = onRequestClose;

  useEffect(() => {
    if (!mounted) return;
    const coarse =
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none)").matches;
    if (!coarse) return;

    const taskId = task.id;
    const onPointerDown = (e: PointerEvent) => {
      const el = cardRef.current;
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (el?.contains(target)) return;
      const trigger = target.closest?.("[data-calendar-preview-trigger]");
      if (trigger?.getAttribute("data-task-id") === taskId) return;
      onRequestCloseRef.current();
    };

    const t = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown, true);
    }, 0);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [mounted, task.id]);

  const style = useMemo(() => {
    const margin = 8;
    const width = 288;
    let top = anchorRect.bottom + margin;
    let left = anchorRect.left;
    const estHeight = 320;
    if (top + estHeight > window.innerHeight - 12) {
      top = Math.max(12, anchorRect.top - estHeight - margin);
    }
    if (left + width > window.innerWidth - 10) {
      left = window.innerWidth - width - 10;
    }
    if (left < 10) left = 10;
    return {
      position: "fixed" as const,
      top,
      left,
      width,
      zIndex: 9999,
    };
  }, [anchorRect]);

  if (!mounted) return null;

  const firstMedia = task.medias[0];
  const isVideo = firstMedia?.type.startsWith("video");

  const node = (
    <div
      ref={cardRef}
      style={style}
      className="flex max-h-[min(380px,calc(100vh-24px))] flex-col overflow-hidden rounded-xl border border-border bg-white text-text drop-shadow-custom"
      onMouseEnter={onPreviewMouseEnter}
      onMouseLeave={onPreviewMouseLeave}
      role="dialog"
      aria-label={`Pré-visualização: ${task.title}`}
    >
      <div className="flex flex-col gap-2 border-b border-border p-4">
        <p className="text-xs font-medium text-shape-text">
          {format(new Date(task.due), "d 'de' MMMM yyyy · HH:mm", {
            locale: ptBR,
          })}
        </p>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-text">
          {task.title}
        </h3>
      </div>

      <div className="relative flex min-h-[120px] shrink-0 items-center justify-center bg-shape">
        {firstMedia && !isVideo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getMediaURL(firstMedia.path)}
            alt=""
            className="max-h-[200px] w-full object-cover"
          />
        ) : firstMedia && isVideo ? (
          <div className="relative flex h-40 w-full items-center justify-center bg-shape">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            >
              <source src={getMediaURL(firstMedia.path)} />
            </video>
            <div className="relative z-[1] flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-md">
              <Play size={24} weight="fill" className="ml-0.5" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-shape-text">
            <ImageIcon size={36} weight="duotone" className="text-shape-text" />
            <span className="text-sm font-medium text-shape-text">
              Sem mídia
            </span>
          </div>
        )}
      </div>

      <div className="p-4 pt-3">
        <Link
          href={`/clientes/${slug}/tarefas/${task.id}`}
          className="flex w-full items-center justify-center rounded-full bg-primary py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Abrir post
        </Link>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
