import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { createUserSchema } from "@/validators/user";
import { UserRole } from "@prisma/client";
import { hash } from "bcrypt";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

export async function POST(request: NextRequest) {
  const session = await getServerSession(nextAuthOptions);
  if (!session || session.user.role !== UserRole.ADMIN) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, password, role } = await createUserSchema.parseAsync(
      body
    );

    const userAlreadyExists = await prismaClient.users.findUnique({
      where: { email },
    });

    if (userAlreadyExists) {
      return new NextResponse(
        "Já existe um usuário cadastrado com esse e-mail",
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 8);
    const user = await prismaClient.users.create({
      data: { name, email, password: hashedPassword, role },
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

    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
