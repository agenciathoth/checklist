import { PrismaClient } from "@prisma/client";
import sha256 from "crypto-js/sha256";

import { env } from "../src/config/env";

const prisma = new PrismaClient();

async function main() {
  const plainPassword = "Checklist@Neto";
  const encryptedPassword = sha256(
    plainPassword.concat(env.PASSWORD_SECRET ?? "")
  ).toString();

  await prisma.users.upsert({
    where: { password: encryptedPassword },
    update: {},
    create: {
      name: "Neto",
      password: encryptedPassword,
      role: "ADMIN",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });
