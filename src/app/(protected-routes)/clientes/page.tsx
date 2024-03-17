import { TitlePage } from "@/components/TitlePage";
import { CustomerForm } from "./CustomerForm";
import { prismaClient } from "@/lib/prisma";
import { CustomersList } from "./CustomersList";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const getCustomers = async () => {
  const customers = await prismaClient.customers.findMany({
    include: { updatedBy: true },
  });

  return customers;
};

export type CustomersWithUser = Prisma.PromiseReturnType<typeof getCustomers>;

export default async function Customers() {
  const customers = await getCustomers();

  return (
    <>
      <TitlePage>Clientes</TitlePage>
      <CustomerForm customers={customers} />
      <CustomersList customers={customers} />
    </>
  );
}
