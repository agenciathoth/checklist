import { prismaClient } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const TASKS_PAGE_SIZE = 20;

export const taskListInclude = {
  customer: true,
  medias: {
    orderBy: {
      order: "asc" as const,
    },
  },
  updatedBy: true,
  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.TasksInclude;

export type TaskListItem = Prisma.TasksGetPayload<{
  include: typeof taskListInclude;
}>;

export const taskEditInclude = {
  medias: {
    orderBy: {
      order: "asc" as const,
    },
  },
} satisfies Prisma.TasksInclude;

export type TaskEditItem = Prisma.TasksGetPayload<{
  include: typeof taskEditInclude;
}>;

type GetCustomerTasksPaginatedParams = {
  customerId: string;
  isLogged?: boolean;
  page?: number;
  limit?: number;
};

export async function getCustomerTasksPaginated({
  customerId,
  isLogged = false,
  page = 1,
  limit = TASKS_PAGE_SIZE,
}: GetCustomerTasksPaginatedParams) {
  const where: Prisma.TasksWhereInput = {
    ...(!isLogged ? { archivedAt: null } : {}),
    customer: { id: customerId },
  };

  const [tasks, total] = await Promise.all([
    prismaClient.tasks.findMany({
      where,
      include: taskListInclude,
      orderBy: [
        { archivedAt: { sort: "asc", nulls: "first" } },
        { due: "asc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prismaClient.tasks.count({ where }),
  ]);

  return {
    tasks,
    pagination: {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    },
  };
}
