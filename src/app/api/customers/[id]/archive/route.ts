import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

export async function PATCH(request: NextRequest, { params }: any) {
  const session = await getServerSession(nextAuthOptions);
  if (!session || session.user.role !== UserRole.ADMIN) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const { id } = await z.object({ id: z.string().min(1) }).parseAsync(params);

    const customer = await prismaClient.customers.findUnique({
      where: { id },
    });
    if (!customer) {
      return new NextResponse("Não foi possível encontrar o cliente", {
        status: 404,
      });
    }

    await prismaClient.customers.update({
      where: { id },
      data: {
        archivedAt: customer.archivedAt ? null : new Date(),
        updatedBy: {
          connect: { id: session.user.id },
        },
      },
    });

    return new NextResponse(null, {
      status: 204,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.issues);
      return new NextResponse("Validation Error", { status: 400 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
