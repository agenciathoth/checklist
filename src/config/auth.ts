import CredentialsProvider from "next-auth/providers/credentials";
import sha256 from "crypto-js/sha256";

import { prismaClient } from "@/lib/prisma";
import { NextAuthOptions } from "next-auth";
import { compare } from "bcrypt";

export const SALT = 8;

export const nextAuthOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password " },
      },

      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prismaClient.users.findUnique({
          where: { email: credentials.email },
        });
        if (!user) {
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
};
