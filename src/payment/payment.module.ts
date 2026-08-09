import { Module } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { PaymentController } from "./payment.controller";
import { PaymentRepository } from "./payment.repository";
import { PaymentService } from "./payment.service";

@Module({
    imports: [],
    controllers: [PaymentController],
    providers: [PaymentService, PaymentRepository, PrismaService]
})

export class PaymentModule { }
