import { prismaClient } from "@/lib/prisma";
import { getCustomerTasksPaginated, TASKS_PAGE_SIZE } from "@/services/tasks";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { nextAuthOptions } from "@/config/auth";

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(TASKS_PAGE_SIZE)
    .default(TASKS_PAGE_SIZE),
});

export async function GET(request: NextRequest, { params }: any) {
  try {
    const { id } = await z.object({ id: z.string().min(1) }).parseAsync(params);

    const { searchParams } = new URL(request.url);
    const { page, limit } = querySchema.parse({
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const customer = await prismaClient.customers.findUnique({
      where: { id },
    });

    if (!customer) {
      return new NextResponse("Cliente não encontrado", { status: 404 });
    }

    const session = await getServerSession(nextAuthOptions);
    const result = await getCustomerTasksPaginated({
      customerId: customer.id,
      isLogged: !!session,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("Validation Error", { status: 400 });
    }

    console.error(error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
