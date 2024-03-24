import { nextAuthOptions } from "@/config/auth";
import { prismaClient } from "@/lib/prisma";
import { createCustomerSchema } from "@/validators/customer";
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
    const { name, presentation, contract, gallery, schedule, whatsapp } =
      await createCustomerSchema.parseAsync(body);

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

    const customer = await prismaClient.customers.create({
      data: {
        name,
        slug,
        presentation: presentation || "",
        contractLink: contract || "",
        galleryLink: gallery || "",
        scheduleLink: schedule || "",
        whatsappLink: whatsapp || "",
        updatedBy: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    if (error instanceof ZodError) {
      console.log(error.issues);
      return new NextResponse("Validation Error", { status: 400 });
    }

    console.log(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
