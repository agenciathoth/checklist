import Link from "next/link";
import { TitlePage } from "@/components/TitlePage";
import { TopNav } from "@/components/TopNav";
import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { getCustomerTasksPaginated } from "@/lib/tasks";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { CustomerPresentation } from "./CustomerPresentation";
import { TaskForm } from "./TaskForm";
import { TasksList } from "./TasksLists";

export const dynamic = "force-dynamic";

export default async function Customer({ params }: any) {
  const { slug } = await params;

  const session = await getServerSession(nextAuthOptions);

  const customer = await prismaClient.customers.findFirst({
    where: { slug },
  });

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

  const { tasks, pagination } = await getCustomerTasksPaginated({
    customerId: customer.id,
    isLogged: !!session,
    page: 1,
  });

  return (
    <>
      <TopNav />

      <TitlePage>Planner | {customer.name}</TitlePage>

      <CustomerPresentation presentation={customer.presentation || ""} />
      {session ? <TaskForm customerId={customer.id} /> : null}

      <Link
        href={`/clientes/${slug}/calendario`}
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-transparent text-secondary border border-secondary font-medium rounded-full hover:opacity-90 transition-opacity"
      >
        Ver calendário
      </Link>

      {pagination.total > 0 ? (
        <TasksList
          initialTasks={tasks}
          initialHasMore={pagination.hasMore}
          customerId={customer.id}
        />
      ) : null}

      <div className="h-16" />
    </>
  );
}
