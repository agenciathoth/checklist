import { prismaClient } from "@/lib/prisma";

import { TitlePage } from "@/components/TitlePage";
import { UserForm } from "./UserForm";
import { UsersList } from "./UsersList";

export const dynamic = "force-dynamic";

export default async function Employees() {
  const users = await prismaClient.users.findMany();

  return (
    <>
      <TitlePage>Funcionários</TitlePage>
      <UserForm users={users} />
      <UsersList users={users} />
    </>
  );
}
