"use client";

import { CustomerWithTasks } from "@/app/clientes/[slug]/page";
import { useMemo, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  Calendar as CalendarIcon,
  List,
} from "@phosphor-icons/react";
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type CalendarProps = {
  initialDate?: Date;
  tasks: NonNullable<CustomerWithTasks>["tasks"];
};

enum ViewMode {
  WEEKLY = "weekly",
  MONTHLY = "monthly",
}

export default function Calendar({
  initialDate = new Date(),
  tasks,
}: CalendarProps) {
  const [date, setDate] = useState<Date>(initialDate);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MONTHLY);

  const formattedDate = useMemo(() => {
    if (viewMode === ViewMode.WEEKLY) {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const endDay = new Date(start);
      endDay.setDate(endDay.getDate() + 6);
      return `${format(start, "d")} – ${format(endDay, "d MMM yyyy", { locale: ptBR })}`;
    }
    return format(date, "MMMM yyyy", { locale: ptBR });
  }, [date, viewMode]);

  const calendarDays = useMemo(() => {
    if (viewMode === ViewMode.WEEKLY) {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      return eachDayOfInterval({
        start,
        end: addWeeks(start, 1),
      }).slice(0, 7);
    }
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [date, viewMode]);

  const weeks = useMemo(() => {
    const days = [...calendarDays];
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, (typeof tasks)[number][]>();
    tasks.forEach((task) => {
      const d = new Date(task.due);
      const key = format(d, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    });
    return map;
  }, [tasks]);

  const getTasksForDay = (day: Date) =>
    tasksByDay.get(format(day, "yyyy-MM-dd")) ?? [];

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between gap-8">
          <button
            type="button"
            className="flex items-center justify-center p-3 bg-slate-100 text-black rounded-full hover:bg-slate-200 transition-colors"
            onClick={() =>
              setDate(
                viewMode === ViewMode.WEEKLY
                  ? subWeeks(date, 1)
                  : subMonths(date, 1),
              )
            }
          >
            <CaretLeft size={16} weight="bold" />
          </button>

          <h2 className="font-semibold text-lg text-slate-800">
            {formattedDate}
          </h2>

          <button
            type="button"
            className="flex items-center justify-center p-3 bg-slate-100 text-black rounded-full hover:bg-slate-200 transition-colors"
            onClick={() =>
              setDate(
                viewMode === ViewMode.WEEKLY
                  ? addWeeks(date, 1)
                  : addMonths(date, 1),
              )
            }
          >
            <CaretRight size={16} weight="bold" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(ViewMode.WEEKLY)}
            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              viewMode === ViewMode.WEEKLY
                ? "border-transparent bg-primary text-white"
                : "border-border bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <List size={16} weight="bold" />
            Semanal
          </button>
          <button
            type="button"
            onClick={() => setViewMode(ViewMode.MONTHLY)}
            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              viewMode === ViewMode.MONTHLY
                ? "border-transparent bg-primary text-white"
                : "border-border bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <CalendarIcon size={16} weight="bold" />
            Mensal
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-7 gap-px rounded-xl border border-border bg-border">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="bg-shape py-2 text-center text-xs font-semibold text-slate-600"
            >
              {day}
            </div>
          ))}
          {weeks.flatMap((week) =>
            week.map((day) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, date);
              return (
                <div
                  key={day.toISOString()}
                  className="min-h-[100px] bg-white p-2"
                >
                  <span
                    className={`text-sm ${isCurrentMonth ? "text-slate-800" : "text-slate-300"}`}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 flex flex-col gap-1">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`rounded-lg px-2 py-1.5 text-left text-xs ${
                          task.completedAt
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-amber-50 text-amber-900"
                        }`}
                      >
                        <p className="truncate font-medium">{task.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </div>
    </>
  );
}
