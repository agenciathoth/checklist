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

  const isAdmin = session?.user.role === UserRole.ADMIN;

  return (
    <>
      <TopNav isAdmin={isAdmin} shouldShowBackButton={isAdmin} />
      {children}
    </>
  );
}
