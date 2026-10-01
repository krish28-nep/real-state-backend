import { Injectable } from "@nestjs/common";
import { Lease, Property, Unit, User } from "prisma/generated/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateLeaseData } from "./interface/create-lease.interface";
import { UpdateLeaseDTO } from "./dto/update-lease.dto";

@Injectable()
export class LeaseRepository {
    constructor(private readonly prisma: PrismaService) { }

    createLease(data: CreateLeaseData): Promise<Lease> {
        return this.prisma.lease.create({ data })
    }

    updateLease(id: number, data: UpdateLeaseDTO): Promise<Lease> {
        return this.prisma.lease.update({ where: { id }, data })
    }

    findById(id: number): Promise<(Lease & { unit: Unit & { property: Property } }) | null> {
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

    findAll(): Promise<Lease[]> {
        return this.prisma.lease.findMany()
    }

    findUnitById(id: number): Promise<(Unit & { property: Property }) | null> {
        return this.prisma.unit.findUnique({
            where: { id },
            include: { property: true }
        })
    }

    findTenantById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } })
    }
}
