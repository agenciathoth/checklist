import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { uploadFile } from "@/utils/uploadFile";
import { createTaskSchema } from "@/validators/task";
import { Prisma, TaskResponsible } from "@prisma/client";
import { parseISO } from "date-fns";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

export async function PUT(request: NextRequest, { params }: any) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, due, responsible, customerId, medias } =
      await createTaskSchema.parse(body);

    const { id } = await z.object({ id: z.string().min(1) }).parseAsync(params);
    const task = await prismaClient.tasks.findUnique({
      where: { id },
    });
    if (!task) {
      return new NextResponse("Não foi possível encontrar a tarefa", {
        status: 404,
      });
    }

    if (medias.length > 0) {
      const parsedMedias: Prisma.MediasCreateManyInput[] = medias.map(
        ({ order, path, type }) => ({
          order,
          path,
          type,
          taskId: id,
          userId: session.user.id,
        })
      );

      const data = await prismaClient.medias.createMany({ data: parsedMedias });
      console.log({ data });
    }

    await prismaClient.tasks.update({
      where: { id },
      data: {
        title,
        description,
        due: parseISO(due),
        responsible: responsible,
        updatedBy: {
          connect: { id: session.user.id },
        },
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

export async function DELETE(request: NextRequest, { params }: any) {
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

    const customerIsArchived = task.archivedAt !== null;
    if (!customerIsArchived) {
      return new NextResponse(
        "Não é possível remover uma tarefa antes de arquivá-la",
        { status: 403 }
      );
    }

    await prismaClient.tasks.delete({
      where: { id },
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
