import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UnitRepository } from "./unit.repository";
import { CreateUnitDTO } from "./dto/create-unit.dto";
import { UpdateUnitDTO } from "./dto/update-unit.dto";
import { Unit } from "prisma/generated/client";

@Injectable()
export class UnitService {
    constructor(private readonly unitRepository: UnitRepository) { }

    async createUnit(ownerId: number, dto: CreateUnitDTO): Promise<Unit> {
        const property = await this.unitRepository.findPropertyById(dto.propertyId)
        if (!property) {
            throw new NotFoundException('Property not found')
        }

        if (property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only add units to your own property')
        }

        return this.unitRepository.createUnit(dto)
    }

    async updateUnit(id: number, ownerId: number, dto: UpdateUnitDTO): Promise<Unit> {
        const unit = await this.unitRepository.findById(id)
        if (!unit) {
            throw new NotFoundException('Unit not found')
        }

        if (unit.property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only update units from your own property')
        }

        if (dto.propertyId) {
            const property = await this.unitRepository.findPropertyById(dto.propertyId)
            if (!property) {
                throw new NotFoundException('Property not found')
            }

            if (property.ownerId !== ownerId) {
                throw new ForbiddenException('You can only move units to your own property')
            }
        }

        return this.unitRepository.updateUnit(id, dto)
    }

    async findById(id: number): Promise<Unit | null> {
        return this.unitRepository.findById(id)
    }

    async findAll(): Promise<Unit[]> {
        return this.unitRepository.findAll()
    }
}
