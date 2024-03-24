import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { TaskResponsible } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

export async function PATCH(request: NextRequest, { params }: any) {
  const session = await getServerSession(nextAuthOptions);

  try {
    const { id } = await z.object({ id: z.string().min(1) }).parseAsync(params);

    const task = await prismaClient.tasks.findUnique({
      where: { id },
    });

    if (!task) {
      return new NextResponse("Não foi possível encontrar a tarefa", {
        status: 404,
      });
    }

    if (task.responsible !== TaskResponsible.CUSTOMER && !session) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    await prismaClient.tasks.update({
      where: { id },
      data: {
        completedAt: task.completedAt ? null : new Date(),
        ...(session
          ? {
              updatedBy: {
                connect: { id: session.user.id },
              },
            }
          : {}),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.issues);
      return new NextResponse("Validation Error", { status: 400 });
    }

    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
