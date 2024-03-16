import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { nextAuthOptions } from "@/config/auth";
import { TopNav } from "@/components/TopNav";
import { UserRole } from "@prisma/client";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const session = await getServerSession(nextAuthOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <>
      <TopNav isAdmin={session.user.role === UserRole.ADMIN} />
      {children}
    </>
  );
}
