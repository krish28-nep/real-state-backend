import { UserRole } from "prisma/generated/enums";

export interface JwtPayload {
  sub: number; // user id
  email: string;
  role: UserRole;
}