import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { createTaskSchema } from "@/validators/task";
import { Prisma, TaskResponsible } from "@prisma/client";
import { parseISO } from "date-fns";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { randomBytes } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/aws";

export async function POST(request: NextRequest) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const body = await request.formData();

    const parsedMedias: Prisma.MediasCreateWithoutTaskInput[] =
      await Promise.all(
        (body.getAll("medias") as File[]).map(async (file, index) => {
          const hash = randomBytes(4).toString("hex");
          const filename = hash.concat("_").concat(file.name);

          const [type] = file.type.split("/");
          const path = (body.get("customerId") as string)
            .concat("/")
            .concat(filename);

          const commandUpload = new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: path,
            Body: (await file.arrayBuffer()) as Buffer,
            ContentType: file.type,
          });

          await s3.send(commandUpload);

          return {
            type,
            order: index + 1,
            path,
            uploadedBy: {
              connect: { id: session.user.id },
            },
          };
        })
      );

    const task = await prismaClient.tasks.create({
      data: {
        title: body.get("title") as string,
        description: body.get("description") as string,
        due: parseISO(body.get("due") as string),
        responsible: body.get("responsible") as TaskResponsible,
        customer: {
          connect: { id: body.get("customerId") as string },
        },
        medias: { create: parsedMedias },
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

    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
