import { TitlePage } from "@/components/TitlePage";
import { TopNav } from "@/components/TopNav";
import { nextAuthOptions } from "@/config/auth";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";

export default async function Customer({ params }: any) {
  const session = await getServerSession(nextAuthOptions);

  return (
    <>
      {session ? (
        <TopNav isAdmin={session?.user.role === UserRole.ADMIN} />
      ) : null}

      <TitlePage>Tarefas do cliente</TitlePage>
    </>
  );
}
