import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { uploadFile } from "@/utils/uploadFile";
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
    const body = await request.formData();

    const { id } = await z.object({ id: z.string().min(1) }).parseAsync(params);

    const task = await prismaClient.tasks.findUnique({
      where: { id },
    });
    if (!task) {
      return new NextResponse("Não foi possível encontrar a tarefa", {
        status: 404,
      });
    }

    const newMedias = (body.getAll("medias") as File[]).map((file, index) => ({
      order: Number(body.getAll("mediasOrder")[index]),
      file,
    }));

    if (newMedias.length > 0) {
      const insertedMedias = await Promise.all(
        newMedias.map(async ({ file, order }) => {
          const media = await uploadFile(
            file,
            body.get("customerId") as string
          );

          const insertedMedia: Prisma.MediasCreateInput = {
            ...media,
            order,
            task: {
              connect: { id },
            },
            uploadedBy: {
              connect: { id: session.user.id },
            },
          };

          return insertedMedia;
        })
      );

      await Promise.all(
        insertedMedias.map((insertedMedia) =>
          prismaClient.medias.create({ data: insertedMedia })
        )
      );
    }

    await prismaClient.tasks.update({
      where: { id },
      data: {
        title: body.get("title") as string,
        description: body.get("description") as string,
        due: parseISO(body.get("due") as string),
        responsible: body.get("responsible") as TaskResponsible,
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
