"use client";

import { CustomerWithTasks } from "@/app/clientes/[slug]/page";
import { useMemo, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  Calendar as CalendarIcon,
  List,
  Plus,
} from "@phosphor-icons/react";
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
  subMonths,
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
    return format(date, "MMMM yyyy", { locale: ptBR });
  }, [date]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [date]);

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

  const weekCards = useMemo(() => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const ranges: { start: Date; end: Date }[] = [];
    let weekStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    while (weekStart <= monthEnd) {
      const weekEnd = addDays(weekStart, 6);
      if (weekEnd >= monthStart) {
        ranges.push({ start: weekStart, end: weekEnd });
      }
      weekStart = addDays(weekStart, 7);
    }
    return ranges;
  }, [date]);

  const getTasksForWeekRange = (range: { start: Date; end: Date }) => {
    return tasks.filter((task) => {
      const d = new Date(task.due);
      return isWithinInterval(d, {
        start: range.start,
        end: endOfDay(range.end),
      });
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-between gap-8">
          <button
            type="button"
            className="flex items-center justify-center p-3 bg-slate-100 text-black rounded-full hover:bg-slate-200 transition-colors"
            onClick={() => setDate(subMonths(date, 1))}
          >
            <CaretLeft size={16} weight="bold" />
          </button>

          <h2 className="font-semibold text-lg text-slate-800">
            {formattedDate}
          </h2>

          <button
            type="button"
            className="flex items-center justify-center p-3 bg-slate-100 text-black rounded-full hover:bg-slate-200 transition-colors"
            onClick={() => setDate(addMonths(date, 1))}
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
        {viewMode === ViewMode.WEEKLY ? (
          <div className="flex flex-col gap-4">
            {weekCards.map((range, index) => {
              const weekTasks = getTasksForWeekRange(range);
              return (
                <article
                  key={`${range.start.toISOString()}-${range.end.toISOString()}`}
                  className="flex flex-col rounded-xl border border-border bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        Semana {index + 1}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {format(range.start, "dd MMM", { locale: ptBR })} –{" "}
                        {format(range.end, "dd MMM", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 min-h-[60px]">
                    {weekTasks.length === 0 ? (
                      <p className="py-6 text-center text-sm text-slate-400">
                        Nenhum conteúdo planejado
                      </p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {weekTasks.map((task) => {
                          const due = new Date(task.due);
                          const isCompleted = !!task.completedAt;

                          return (
                            <li
                              key={task.id}
                              className={`flex gap-3 rounded-lg border border-border bg-white py-3 pl-3 pr-3 ${
                                isCompleted
                                  ? "border-l-4 border-l-emerald-500"
                                  : "border-l-4 border-l-amber-400"
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs text-slate-500">
                                  {format(due, "d MMM - HH:mm", {
                                    locale: ptBR,
                                  })}
                                </p>
                                <p className="mt-0.5 font-medium text-slate-800">
                                  {task.title}
                                </p>
                                <span
                                  className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                                    isCompleted
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {isCompleted ? "Aprovado" : "Pendente"}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
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
        )}
      </div>
    </>
  );
}
