import { prismaClient } from "@/lib/prisma";
export default async function Home() {
  const users = await prismaClient.users.findMany();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </main>
  );
}
