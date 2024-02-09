// import { UserRole } from "@prisma/client";
import NextAuth, { type DefaultSession } from "next-auth";
import { type DefaultJWT } from "next-auth/jwt";

export type UserTypes = {
  // Properties you want in your User. I would advise against using the whole prisma user object.
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
};

export type ExtendedUser = DefaultSession["user"] & UserTypes;

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

type ExtendedJWT = DefaultJWT & UserTypes;

declare module "next-auth/jwt" {
  interface JWT extends ExtendedJWT {
    // Properties you want in the JWT that you are not extending to the session. This already contains everything in UserTypes
    lastEmailLogin: Date | null;
    lastPhoneLogin: Date | null;
    loginVerified: Date | null;
    verifyRequestId: string | null;
    createdAt: Date;
    updatedAt: Date;
  }
}
