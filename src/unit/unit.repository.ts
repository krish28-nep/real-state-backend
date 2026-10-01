import { Injectable } from "@nestjs/common";
import { Property, Unit } from "prisma/generated/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateUnitData } from "./interface/create-unit.interface";
import { UpdateUnitDTO } from "./dto/update-unit.dto";

@Injectable()
export class UnitRepository {
    constructor(private readonly prisma: PrismaService) { }

    createUnit(data: CreateUnitData): Promise<Unit> {
        return this.prisma.unit.create({ data })
    }

    updateUnit(id: number, data: UpdateUnitDTO): Promise<Unit> {
        return this.prisma.unit.update({ where: { id }, data })
    }

    findById(id: number): Promise<(Unit & { property: Property }) | null> {
        return this.prisma.unit.findUnique({
            where: { id },
            include: { property: true }
        })
    }

    findAll(): Promise<Unit[]> {
        return this.prisma.unit.findMany()
    }

    findPropertyById(id: number): Promise<Property | null> {
        return this.prisma.property.findUnique({ where: { id } })
    }
}
