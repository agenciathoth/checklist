import { PrismaClient, TaskResponsible, UserRole } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const plainPassword = "Checklist@Neto";
  const encryptedPassword = await hash(plainPassword, 8);

  const user = await prisma.users.upsert({
    where: { email: "vilsonsampaiodev@gmail.com" },
    update: {
      password: encryptedPassword,
      role: UserRole.ADMIN,
    },
    create: {
      name: "Neto",
      email: "vilsonsampaiodev@gmail.com",
      password: encryptedPassword,
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.customers.create({
    data: {
      name: "Teste",
      slug: "teste",
      updatedBy: { connect: { id: user.id } },
    },
  });

  await prisma.tasks.create({
    data: {
      title: "Tarefa 1",
      description: "Descrição da tarefa 1",
      due: new Date(),
      responsible: TaskResponsible.CUSTOMER,
      customer: { connect: { id: customer.id } },
      updatedBy: { connect: { id: user.id } },
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
