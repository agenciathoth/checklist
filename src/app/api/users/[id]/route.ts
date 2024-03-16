import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { createUserSchema, editUserSchema } from "@/validators/user";
import { UserRole } from "@prisma/client";
import { hash } from "bcrypt";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

export async function PUT(request: NextRequest, { params }: any) {
  const session = await getServerSession(nextAuthOptions);
  if (!session || session.user.role !== UserRole.ADMIN) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, email, password, role } = await editUserSchema
      .extend({ id: z.string().min(1) })
      .parseAsync({ ...params, ...body });

    const user = await prismaClient.users.findUnique({
      where: { id },
    });

    if (!user) {
      return new NextResponse("Não foi possível encontrar o usuário", {
        status: 404,
      });
    }

    const hashedPassword = password ? await hash(password, 8) : undefined;
    await prismaClient.users.update({
      where: { id },
      data: {
        name,
        email,
        password: hashedPassword,
        role,
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

export async function DELETE(request: NextRequest, { params }: any) {
  const session = await getServerSession(nextAuthOptions);
  if (!session || session.user.role !== UserRole.ADMIN) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const { id } = await z.object({ id: z.string().min(1) }).parseAsync(params);

    const user = await prismaClient.users.findUnique({
      where: { id },
    });

    if (!user) {
      return new NextResponse("Não foi possível encontrar o usuário", {
        status: 404,
      });
    }

    const userIsArchived = user.archivedAt !== null;
    if (!userIsArchived) {
      return new NextResponse(
        "Não é possível remover um usuário antes de arquivá-lo",
        {
          status: 403,
        }
      );
    }

    await prismaClient.users.delete({
      where: { id },
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
