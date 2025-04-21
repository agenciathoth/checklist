import { prismaClient } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const getComments = async (taskId: string) => {
  return prismaClient.comments.findMany({
    where: { taskId, parentId: null },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      author: true,
      text: true,
      isLiked: true,
      replies: {
        select: {
          id: true,
          author: true,
          text: true,
          isLiked: true,
          createdBy: {
            select: { id: true, name: true },
          },
          createdAt: true,
          updatedAt: true,
        },
      },
      createdBy: {
        select: { id: true, name: true },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
};

export type Comments = Prisma.PromiseReturnType<typeof getComments>;
export type Comment = Comments[number];
