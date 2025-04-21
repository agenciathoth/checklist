import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { Prisma, TaskResponsible } from "@prisma/client";
import { parseISO } from "date-fns";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { createCommentSchema } from "@/validators/comment";
import { getComments } from "@/utils/api";

export async function GET(request: NextRequest, { params }: any) {
  try {
    const { id } = await z.object({ id: z.string().min(1) }).parseAsync(params);

    const comments = await getComments(id);

    console.log(comments);

    return NextResponse.json(!Array.isArray(comments) ? [] : comments);
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.issues);
      return new NextResponse("Validation Error", { status: 400 });
    }

    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: any) {
  const session = await getServerSession(nextAuthOptions);

  const { id } = await z.object({ id: z.string().min(1) }).parseAsync(params);

  try {
    const body = await request.json();
    const { author, text, parentId } = await createCommentSchema.parseAsync({
      ...body,
      userId: session?.user.id,
    });

    const comment = await prismaClient.comments.create({
      data: {
        text,
        author: session?.user.id ? null : author,
        task: { connect: { id } },
        ...(session?.user.id
          ? { createdBy: { connect: { id: session.user.id } } }
          : {}),
        ...(parentId ? { parent: { connect: { id: parentId } } } : {}),
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.issues);
      return new NextResponse("Validation Error", { status: 400 });
    }

    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
