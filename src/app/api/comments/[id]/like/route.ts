import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";

export async function PATCH(request: NextRequest, { params }: any) {
  const session = await getServerSession(nextAuthOptions);

  try {
    const { id } = await z.object({ id: z.string().min(1) }).parseAsync(params);

    const comment = await prismaClient.comments.findUnique({
      where: { id },
    });
    if (!comment) {
      return new NextResponse("Não foi possível encontrar o comentário", {
        status: 404,
      });
    }

    if (
      comment.userId === session?.user.id ||
      (!session?.user.id && !!comment.author)
    ) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    await prismaClient.comments.update({
      where: { id },
      data: { isLiked: !comment.isLiked },
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
