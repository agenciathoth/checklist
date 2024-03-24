import CredentialsProvider from "next-auth/providers/credentials";

import { prismaClient } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import { compare } from "bcrypt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

export const SALT = 8;

export const nextAuthOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prismaClient),

  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "credentials",

      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password " },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prismaClient.users.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.archivedAt) {
          return null;
        }

        const passwordMatches = await compare(
          credentials.password,
          user.password
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      const user = await prismaClient.users.findUnique({
        where: { id: token.sub },
        select: { id: true, role: true },
      });

      if (user) {
        session.user.id = user.id;
        session.user.role = user.role;
      }

      return session;
    },
  },
};
