import { TitlePage } from "@/components/TitlePage";
import { CustomerForm } from "./CustomerForm";
import { prismaClient } from "@/lib/prisma";
import { CustomersList } from "./CustomersList";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

const getCustomers = async () => {
  const customers = await prismaClient.customers.findMany({
    include: { updatedBy: true },
    orderBy: { name: "asc" },
  });

  return customers.sort((a, b) => {
    if (a.archivedAt) {
      return 1;
    }

    if (b.archivedAt) {
      return -1;
    }

    return 1;
  });
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
