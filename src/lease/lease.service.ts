import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Lease } from "prisma/generated/client";
import { CreateLeaseDTO } from "./dto/create-lease.dto";
import { UpdateLeaseDTO } from "./dto/update-lease.dto";
import { LeaseRepository } from "./lease.repository";

@Injectable()
export class LeaseService {
    constructor(private readonly leaseRepository: LeaseRepository) { }

    async createLease(ownerId: number, dto: CreateLeaseDTO): Promise<Lease> {
        const unit = await this.leaseRepository.findUnitById(dto.unitId)
        if (!unit) {
            throw new NotFoundException('Unit not found')
        }

        if (unit.property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only create leases for your own units')
        }

        const tenant = await this.leaseRepository.findTenantById(dto.tenantId)
        if (!tenant) {
            throw new NotFoundException('Tenant not found')
        }

        return this.leaseRepository.createLease(dto)
    }

    async updateLease(id: number, ownerId: number, dto: UpdateLeaseDTO): Promise<Lease> {
        const lease = await this.leaseRepository.findById(id)
        if (!lease) {
            throw new NotFoundException('Lease not found')
        }

        if (lease.unit.property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only update leases for your own units')
        }

        if (dto.unitId) {
            const unit = await this.leaseRepository.findUnitById(dto.unitId)
            if (!unit) {
                throw new NotFoundException('Unit not found')
            }

            if (unit.property.ownerId !== ownerId) {
                throw new ForbiddenException('You can only move leases to your own units')
            }
        }

        if (dto.tenantId) {
            const tenant = await this.leaseRepository.findTenantById(dto.tenantId)
            if (!tenant) {
                throw new NotFoundException('Tenant not found')
            }
        }

        return this.leaseRepository.updateLease(id, dto)
    }

    async findById(id: number): Promise<Lease | null> {
        return this.leaseRepository.findById(id)
    }

    async findAll(): Promise<Lease[]> {
        return this.leaseRepository.findAll()
    }
}
