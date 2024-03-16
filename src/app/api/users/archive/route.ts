import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = await z.object({ id: z.string().min(1) }).parseAsync(body);

    const user = await prismaClient.users.findUnique({
      where: { id },
    });

    if (!user) {
      return new NextResponse("Não foi possível encontrar o usuário", {
        status: 404,
      });
    }

    await prismaClient.users.update({
      where: { id },
      data: {
        archivedAt: user.archivedAt ? null : new Date(),
      },
    });

    return NextResponse.json([]);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
