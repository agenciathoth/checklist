import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const plainPassword = "Checklist@Neto";
  const encryptedPassword = await hash(plainPassword, 8);

  await prisma.users.upsert({
    where: { password: encryptedPassword },
    update: {},
    create: {
      name: "Neto",
      email: "vilsonsampaiodev@gmail.com",
      password: encryptedPassword,
      role: UserRole.ADMIN,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
