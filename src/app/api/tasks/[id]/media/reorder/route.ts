import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

export async function PUT(request: NextRequest, { params }: any) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

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

    const remainingMedias = await prismaClient.medias.findMany({
      where: { taskId: id },
      orderBy: { order: "asc" },
    });
    await Promise.all(
      remainingMedias.map((media, index) =>
        prismaClient.medias.update({
          where: { id: media.id },
          data: { order: index + 1 },
        })
      )
    );

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
