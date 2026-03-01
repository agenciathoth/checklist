import Calendar from "@/components/Calendar";
import { TitlePage } from "@/components/TitlePage";
import { TopNav } from "@/components/TopNav";
import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const getMonthTasks = async (slug: string, isLogged?: boolean) => {
  const customer = await prismaClient.customers.findFirst({
    where: { slug },
  });

  if (!customer) {
    return null;
  }

  const tasks = await prismaClient.tasks.findMany({
    where: {
      ...(!isLogged ? { archivedAt: null } : {}),
      customer: { id: customer.id },
    },
    select: {
      customer: true,
      archivedAt: true,
      due: true,
      id: true,
      title: true,
      completedAt: true,
    },
    orderBy: {
      due: "asc",
    },
  });

  return {
    ...customer,
    tasks: [...tasks].sort((a, b) => {
      if (a.archivedAt) {
        return 1;
      }

      if (b.archivedAt) {
        return -1;
      }

      return 1;
    }),
  };
};

export type MonthTasks = Prisma.PromiseReturnType<typeof getMonthTasks>;

export const dynamic = "force-dynamic";

export default async function CustomerCalendar({ params }: any) {
  const { slug } = await params;

  const session = await getServerSession(nextAuthOptions);

  const customer = await getMonthTasks(slug, !!session);

  if (!customer) {
    if (session) {
      redirect("/clientes");
    }

    return (
      <>
        <TitlePage>Calendário | Cliente não encontrado</TitlePage>
      </>
    );
  }

  return (
    <>
      <TopNav />

      <TitlePage>Calendário | {customer.name}</TitlePage>

      <Calendar slug={slug} tasks={customer.tasks} />
    </>
  );
}
