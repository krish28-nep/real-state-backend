import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Lease, RentalApplication } from "prisma/generated/client";
import { ApplicationStatus, UnitStatus } from "prisma/generated/enums";
import { ApproveApplicationDTO } from "./dto/approve-application.dto";
import { CreateApplicationDTO } from "./dto/create-application.dto";
import { UpdateApplicationDTO } from "./dto/update-application.dto";
import { ApplicationRepository } from "./application.repository";

@Injectable()
export class ApplicationService {
    constructor(private readonly applicationRepository: ApplicationRepository) { }

    async createApplication(tenantId: number, dto: CreateApplicationDTO): Promise<RentalApplication> {
        const unit = await this.applicationRepository.findUnitById(dto.unitId)
        if (!unit) {
            throw new NotFoundException('Unit not found')
        }

        if (unit.status !== UnitStatus.AVAILABLE) {
            throw new BadRequestException('You can only apply for available units')
        }

        const existingApplication = await this.applicationRepository.findPendingByTenantAndUnit(tenantId, dto.unitId)
        if (existingApplication) {
            throw new BadRequestException('You already have a pending application for this unit')
        }

        return this.applicationRepository.createApplication({
            tenantId,
            ...dto
        })
    }

    async updateApplication(id: number, userId: number, dto: UpdateApplicationDTO): Promise<RentalApplication> {
        const application = await this.applicationRepository.findById(id)
        if (!application) {
            throw new NotFoundException('Application not found')
        }

        if (application.tenantId !== userId && application.unit.property.ownerId !== userId) {
            throw new ForbiddenException('You can only update your own application')
        }

        if (dto.unitId) {
            const unit = await this.applicationRepository.findUnitById(dto.unitId)
            if (!unit) {
                throw new NotFoundException('Unit not found')
            }

            if (unit.status !== UnitStatus.AVAILABLE) {
                throw new BadRequestException('You can only apply for available units')
            }
        }

        return this.applicationRepository.updateApplication(id, dto)
    }

    async approveApplication(id: number, ownerId: number, dto: ApproveApplicationDTO): Promise<Lease> {
        const application = await this.applicationRepository.findById(id)
        if (!application) {
            throw new NotFoundException('Application not found')
        }

        if (application.unit.property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only approve applications for your own units')
        }

        if (application.status !== ApplicationStatus.PENDING) {
            throw new BadRequestException('Only pending applications can be approved')
        }

        if (application.unit.status !== UnitStatus.AVAILABLE) {
            throw new BadRequestException('This unit is not available')
        }

        return this.applicationRepository.approveApplication(application, dto)
    }

    async rejectApplication(id: number, ownerId: number): Promise<RentalApplication> {
        const application = await this.applicationRepository.findById(id)
        if (!application) {
            throw new NotFoundException('Application not found')
        }

        if (application.unit.property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only reject applications for your own units')
        }

        return this.applicationRepository.updateApplication(id, {
            status: ApplicationStatus.REJECTED
        })
    }

    async findById(id: number): Promise<RentalApplication | null> {
        return this.applicationRepository.findById(id)
    }

    async findAll(): Promise<RentalApplication[]> {
        return this.applicationRepository.findAll()
    }
}
