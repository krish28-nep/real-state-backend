import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Payment } from "prisma/generated/client";
import { CreatePaymentDTO } from "./dto/create-payment.dto";
import { UpdatePaymentDTO } from "./dto/update-payment.dto";
import { PaymentRepository } from "./payment.repository";

@Injectable()
export class PaymentService {
    constructor(private readonly paymentRepository: PaymentRepository) { }

    async createPayment(userId: number, dto: CreatePaymentDTO): Promise<Payment> {
        const lease = await this.paymentRepository.findLeaseById(dto.leaseId)
        if (!lease) {
            throw new NotFoundException('Lease not found')
        }

        if (lease.tenantId !== userId && lease.unit.property.ownerId !== userId) {
            throw new ForbiddenException('You can only create payments for your own lease')
        }

        return this.paymentRepository.createPayment(dto)
    }

    async updatePayment(id: number, userId: number, dto: UpdatePaymentDTO): Promise<Payment> {
        const payment = await this.paymentRepository.findById(id)
        if (!payment) {
            throw new NotFoundException('Payment not found')
        }

        if (payment.lease.tenantId !== userId && payment.lease.unit.property.ownerId !== userId) {
            throw new ForbiddenException('You can only update payments for your own lease')
        }

        if (dto.leaseId) {
            const lease = await this.paymentRepository.findLeaseById(dto.leaseId)
            if (!lease) {
                throw new NotFoundException('Lease not found')
            }

            if (lease.tenantId !== userId && lease.unit.property.ownerId !== userId) {
                throw new ForbiddenException('You can only move payments to your own lease')
            }
        }

        return this.paymentRepository.updatePayment(id, dto)
    }

    async findById(id: number): Promise<Payment | null> {
        return this.paymentRepository.findById(id)
    }

    async findAll(): Promise<Payment[]> {
        return this.paymentRepository.findAll()
    }
}
