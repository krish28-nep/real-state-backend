import { Injectable } from "@nestjs/common";
import { Lease, Payment, Property, Unit } from "prisma/generated/client";
import { PrismaService } from "prisma/prisma.service";
import { CreatePaymentData } from "./interface/create-payment.interface";
import { UpdatePaymentDTO } from "./dto/update-payment.dto";

type LeaseWithUnitProperty = Lease & { unit: Unit & { property: Property } }
type PaymentWithLease = Payment & { lease: LeaseWithUnitProperty }

@Injectable()
export class PaymentRepository {
    constructor(private readonly prisma: PrismaService) { }

    createPayment(data: CreatePaymentData): Promise<Payment> {
        return this.prisma.payment.create({ data })
    }

    updatePayment(id: number, data: UpdatePaymentDTO): Promise<Payment> {
        return this.prisma.payment.update({ where: { id }, data })
    }

    findById(id: number): Promise<PaymentWithLease | null> {
        return this.prisma.payment.findUnique({
            where: { id },
            include: {
                lease: {
                    include: {
                        unit: {
                            include: {
                                property: true
                            }
                        }
                    }
                }
            }
        })
    }

    findAll(): Promise<Payment[]> {
        return this.prisma.payment.findMany()
    }

    findLeaseById(id: number): Promise<LeaseWithUnitProperty | null> {
        return this.prisma.lease.findUnique({
            where: { id },
            include: {
                unit: {
                    include: {
                        property: true
                    }
                }
            }
        })
    }
}
