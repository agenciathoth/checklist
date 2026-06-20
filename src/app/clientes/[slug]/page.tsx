import { TitlePage } from "@/components/TitlePage";
import { TopNav } from "@/components/TopNav";
import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { getCustomerTasksPaginated } from "@/services/tasks";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { CustomerPresentation } from "./CustomerPresentation";
import { CustomerClient } from "./CustomerClient";

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

      <CustomerClient
        customerId={customer.id}
        customerSlug={slug}
        initialTasks={tasks}
        initialHasMore={pagination.hasMore}
        showTaskForm={!!session}
      />

      <div className="h-16" />
    </>
  );
}
