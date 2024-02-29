import NextAuth, { NextAuthOptions } from "next-auth";

import { prismaClient } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";

export const nextAuthOptions: NextAuthOptions = {
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

        const user = await prismaClient.users.findFirst({
          where: { secret: credentials?.secret },
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
