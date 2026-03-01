import { TitlePage } from "@/components/TitlePage";
import { prismaClient } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TaskDetail } from "./TaskDetail";
import { getServerSession } from "next-auth";
import { nextAuthOptions } from "@/config/auth";
import { TopNav } from "@/components/TopNav";

const getTask = async (slug: string, taskId: string, isLogged?: boolean) => {
  const task = await prismaClient.tasks.findFirst({
    where: {
      id: taskId,
      customer: { slug },
      ...(!isLogged ? { archivedAt: null } : {}),
    },
    include: {
      customer: true,
      medias: {
        orderBy: { order: "asc" },
      },
      updatedBy: true,
      _count: {
        select: { comments: true },
      },
    },
  });

  return task;
};

export const dynamic = "force-dynamic";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ slug: string; taskId: string }>;
}) {
  const { slug, taskId } = await params;

  const session = await getServerSession(nextAuthOptions);
  const task = await getTask(slug, taskId, !!session);

  if (!task) {
    notFound();
  }

  return (
    <>
      <TopNav />
      <TitlePage>Tarefa | {task.customer.name}</TitlePage>
      <TaskDetail task={task} />
    </>
  );
}
