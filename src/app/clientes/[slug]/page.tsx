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

const getCustomerWithTasks = async (slug: string) => {
  const customer = await prismaClient.customers.findUnique({
    where: { slug },
    include: { tasks: true },
  });

  return customer;
};

export type CustomersWithUser = Prisma.PromiseReturnType<
  typeof getCustomerWithTasks
>;

export default async function Customer({ params }: any) {
  const session = await getServerSession(nextAuthOptions);

  const customer = await getCustomerWithTasks(params.slug);

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

      {session ? <TaskForm tasks={customer.tasks} /> : null}

      <div>List</div>

      <BottomNav {...customer} />
    </>
  );
}
