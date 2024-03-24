import { TitlePage } from "@/components/TitlePage";
import { TopNav } from "@/components/TopNav";
import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { Prisma, UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { CustomerPresentation } from "./CustomerPresentation";
import { BottomNav } from "./BottomNav";
import { TaskForm } from "./TaskForm";
import { TasksList } from "./TasksLists";

const getCustomerWithTasks = async (slug: string, isLogged?: boolean) => {
  const [customer] = await prismaClient.customers.findMany({
    where: { slug },
  });

  const tasks = await prismaClient.tasks.findMany({
    where: {
      ...(!isLogged ? { archivedAt: null } : {}),
      customer: { id: customer.id },
    },
    include: {
      customer: true,
      updatedBy: true,
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

export type CustomerWithTasks = Prisma.PromiseReturnType<
  typeof getCustomerWithTasks
>;

export const dynamic = "force-dynamic";

export default async function Customer({ params }: any) {
  const session = await getServerSession(nextAuthOptions);

  const customer = await getCustomerWithTasks(params.slug, !!session);

  if (!customer) {
    if (session) {
      redirect("/clientes");
    }

    return null;
  }

  return (
    <>
      {session ? <TopNav /> : null}

      <TitlePage>Checklist | {customer.name}</TitlePage>

      <CustomerPresentation presentation={customer.presentation || ""} />
      {session ? (
        <TaskForm customerId={customer.id} tasks={customer.tasks} />
      ) : null}
      {!!customer.tasks.length && <TasksList tasks={customer.tasks} />}

      <div className="h-16" />

      <BottomNav {...customer} />
    </>
  );
}
