import prisma from "@/lib/prisma";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { $LogInSchema } from "./lib/validation";
import { getUserById } from "./data/user";
import { PrismaAdapter } from "@auth/prisma-adapter";

export default {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      // Optional for /api/auth/signin
      credentials: {
        email: { label: "Email", type: "email" },
        phone: { label: "Phone", type: "tel" },
      },
      async authorize(credentials, req) {
        const validatedFields = $LogInSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, phone } = validatedFields.data;
          const user = await prisma.user.findFirst({
            where: {
              OR: [{ email }, { phone }],
            },
          });

          if (!user) return null;

          return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const user = await getUserById(token.sub);

      if (!user) return token;

      token.role = user.role;

      return token;
    },
  },
  jwt: { maxAge: 365 * 24 * 60 * 60 },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 365 * 24 * 60 * 60 },
} satisfies NextAuthConfig;
