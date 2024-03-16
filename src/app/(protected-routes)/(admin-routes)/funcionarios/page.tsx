import { getServerSession } from "next-auth";

import { prismaClient } from "@/lib/prisma";

import { Logout } from "@/app/auth";

export default async function Employees() {
  const session = await getServerSession();

  const users = await prismaClient.users.findMany({
    select: {
      id: true,
      name: true,
      role: true,
    },
  });

  return (
    <div>
      <Logout />

      <h1>Funcionários</h1>

      <pre>{JSON.stringify(session)}</pre>
      <pre>{JSON.stringify(users)}</pre>
    </div>
  );
}
