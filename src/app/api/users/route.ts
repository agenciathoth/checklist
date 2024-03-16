import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { createUserSchema } from "@/validators/user";
import { UserRole } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

export async function POST(request: NextRequest) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  const body = await request.json();

  try {
    const data = await createUserSchema.parseAsync(body);

    const userAlreadyExists = await prismaClient.users.findUnique({
      where: {
        email: body.email,
      },
    });

    if (userAlreadyExists) {
      return new NextResponse(
        "Já existe um usuário cadastrado com esse e-mail",
        { status: 409 }
      );
    }

    const user = await prismaClient.users.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.issues);
      return new NextResponse("Validation Error", { status: 400 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
