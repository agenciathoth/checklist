import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { createCustomerSchema } from "@/validators/customer";
import { createTaskSchema } from "@/validators/task";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { ZodError, z } from "zod";

export async function POST(request: NextRequest) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, due, responsible, customerId } =
      await createTaskSchema.parseAsync(body);

    const task = await prismaClient.tasks.create({
      data: {
        title,
        description,
        due,
        responsible,
        customer: {
          connect: { id: customerId },
        },
        updatedBy: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.issues);
      return new NextResponse("Validation Error", { status: 400 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
