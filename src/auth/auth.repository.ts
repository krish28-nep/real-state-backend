import { Injectable } from '@nestjs/common';
import { User } from 'prisma/generated/client';
import { UserRole } from 'prisma/generated/enums';
import { PrismaService } from 'prisma/prisma.service';

interface CreateUserData {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createUser(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data });
  }
}