import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { createCustomerSchema } from "@/validators/customer";
import { createUserSchema, editUserSchema } from "@/validators/user";
import { UserRole } from "@prisma/client";
import { hash } from "bcrypt";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { ZodError, z } from "zod";

export async function PUT(request: NextRequest, { params }: any) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, presentation, contract, gallery, schedule, whatsapp } =
      await createCustomerSchema
        .extend({ id: z.string().min(1) })
        .parseAsync({ ...params, ...body });

    const customer = await prismaClient.customers.findUnique({
      where: { id },
    });

    if (!customer) {
      return new NextResponse("Não foi possível encontrar o cliente", {
        status: 404,
      });
    }

    let slug = slugify(name.toLowerCase());

    const slugAlreadyExists = await prismaClient.customers.findFirst({
      where: {
        slug: { startsWith: slug },
      },
      orderBy: { slug: "desc" },
    });

    if (slugAlreadyExists) {
      const slugIndex = Number(slugAlreadyExists.slug.split("-").pop()) ?? 0;

      slug += "-".concat(String(slugIndex + 1));
    }

    await prismaClient.customers.update({
      where: { id },
      data: {
        name,
        slug,
        presentation: presentation,
        whatsappLink: whatsapp,
        contractLink: contract,
        galleryLink: gallery,
        scheduleLink: schedule,
        updatedBy: {
          connect: { id: session.user.id },
        },
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
  if (!session) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  try {
    const { id } = await z.object({ id: z.string().min(1) }).parseAsync(params);

    const customer = await prismaClient.customers.findUnique({
      where: { id },
    });

    if (!customer) {
      return new NextResponse("Não foi possível encontrar o cliente", {
        status: 404,
      });
    }

    const customerIsArchived = customer.archivedAt !== null;
    if (!customerIsArchived) {
      return new NextResponse(
        "Não é possível remover um cliente antes de arquivá-lo",
        {
          status: 403,
        }
      );
    }

    await prismaClient.customers.delete({
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
