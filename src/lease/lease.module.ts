import { Module } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { LeaseController } from "./lease.controller";
import { LeaseRepository } from "./lease.repository";
import { LeaseService } from "./lease.service";

@Module({
    imports: [],
    controllers: [LeaseController],
    providers: [LeaseService, LeaseRepository, PrismaService]
})

export class LeaseModule { }
