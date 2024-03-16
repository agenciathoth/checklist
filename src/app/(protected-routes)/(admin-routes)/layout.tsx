import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { nextAuthOptions } from "@/config/auth";
import { UserRole } from "@prisma/client";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(nextAuthOptions);

  if (session?.user.role !== UserRole.ADMIN) {
    redirect("/clientes");
  }

  return <>{children}</>;
}
