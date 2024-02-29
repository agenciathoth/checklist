import { getServerSession } from "next-auth";
import { Login, Logout } from "../auth";
import { prismaClient } from "@/lib/prisma";

export default async function Customers() {
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
      <h1>Olá, {JSON.stringify(session)}</h1>

      <Login />
      <Logout />

      <pre>{JSON.stringify(users)}</pre>
    </div>
  );
}
