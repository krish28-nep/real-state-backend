import { Injectable } from "@nestjs/common";
import { Lease, Property, RentalApplication, Unit } from "prisma/generated/client";
import { ApplicationStatus, UnitStatus } from "prisma/generated/enums";
import { PrismaService } from "prisma/prisma.service";
import { ApproveApplicationDTO } from "./dto/approve-application.dto";
import { CreateApplicationData } from "./interface/create-application.interface";
import { UpdateApplicationDTO } from "./dto/update-application.dto";

@Injectable()
export class ApplicationRepository {
    constructor(private readonly prisma: PrismaService) { }

    createApplication(data: CreateApplicationData): Promise<RentalApplication> {
        return this.prisma.rentalApplication.create({ data })
    }

    updateApplication(id: number, data: UpdateApplicationDTO): Promise<RentalApplication> {
        return this.prisma.rentalApplication.update({ where: { id }, data })
    }

    findById(id: number): Promise<(RentalApplication & { unit: Unit & { property: Property } }) | null> {
        return this.prisma.rentalApplication.findUnique({
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

    findAll(): Promise<RentalApplication[]> {
        return this.prisma.rentalApplication.findMany()
    }

    findUnitById(id: number): Promise<(Unit & { property: Property }) | null> {
        return this.prisma.unit.findUnique({
            where: { id },
            include: { property: true }
        })
    }

    findPendingByTenantAndUnit(tenantId: number, unitId: number): Promise<RentalApplication | null> {
        return this.prisma.rentalApplication.findFirst({
            where: {
                tenantId,
                unitId,
                status: ApplicationStatus.PENDING
            }
        })
    }

    approveApplication(application: RentalApplication, dto: ApproveApplicationDTO): Promise<Lease> {
        return this.prisma.$transaction(async (tx) => {
            const lease = await tx.lease.create({
                data: {
                    tenantId: application.tenantId,
                    unitId: application.unitId,
                    startDate: dto.startDate,
                    endDate: dto.endDate,
                    monthlyRent: dto.monthlyRent,
                    securityDeposit: dto.securityDeposit,
                    leaseStatus: dto.leaseStatus
                }
            })

            await tx.rentalApplication.update({
                where: { id: application.id },
                data: { status: ApplicationStatus.APPROVED }
            })

            await tx.rentalApplication.updateMany({
                where: {
                    unitId: application.unitId,
                    id: { not: application.id },
                    status: ApplicationStatus.PENDING
                },
                data: { status: ApplicationStatus.REJECTED }
            })

            await tx.unit.update({
                where: { id: application.unitId },
                data: { status: UnitStatus.OCCUPIED }
            })

            return lease
        })
    }
}
