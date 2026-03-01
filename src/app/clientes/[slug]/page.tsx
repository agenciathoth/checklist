import Link from "next/link";
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
    include: {
      customer: true,
      medias: {
        orderBy: {
          order: "asc",
        },
      },
      updatedBy: true,
      _count: {
        select: {
          comments: true,
        },
      },
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
  const { slug } = await params;

  const session = await getServerSession(nextAuthOptions);

  const customer = await getCustomerWithTasks(slug, !!session);

  if (!customer) {
    if (session) {
      redirect("/clientes");
    }

    return (
      <>
        <TitlePage>Planner | Cliente não encontrado</TitlePage>
      </>
    );
  }

  return (
    <>
      {session ? <TopNav /> : null}

      <TitlePage>Planner | {customer.name}</TitlePage>

      <CustomerPresentation presentation={customer.presentation || ""} />
      {session ? (
        <TaskForm customerId={customer.id} tasks={customer.tasks} />
      ) : null}

      <Link
        href={`/clientes/${slug}/calendario`}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-transparent text-secondary border border-secondary font-medium rounded-full hover:opacity-90 transition-opacity"
      >
        Ver calendário
      </Link>

      {!!customer.tasks.length && <TasksList tasks={customer.tasks} />}

      <div className="h-16" />
    </>
  );
}
