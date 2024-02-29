import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import sha256 from "crypto-js/sha256";

import { prismaClient } from "@/lib/prisma";

const nextAuthOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        secret: { label: "secret", type: "password " },
      },
      async authorize(credentials) {
        if (!credentials?.secret) {
          return null;
        }

        const hashedSecret = sha256(
          credentials.secret.concat(process.env.PASSWORD_SECRET ?? "")
        ).toString();

        const user = await prismaClient.users.findUnique({
          where: { password: hashedSecret },
          select: {
            id: true,
            name: true,
            role: true,
          },
        });

        return user;
      },
    }),
  ],
};

const handler = NextAuth(nextAuthOptions);

export { handler as GET, handler as POST };
