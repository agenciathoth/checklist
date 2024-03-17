import { TitlePage } from "@/components/TitlePage";
import { CustomerForm } from "./CustomerForm";
import { prismaClient } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Customers() {
  const customers = await prismaClient.customers.findMany();

  return (
    <>
      <TitlePage>Clientes</TitlePage>

      <CustomerForm customers={customers} />

      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>{customer.name}</li>
        ))}
      </ul>
    </>
  );
}
