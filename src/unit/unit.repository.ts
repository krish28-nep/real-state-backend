import { Injectable } from "@nestjs/common";
import { Property, Unit, UnitImage } from "prisma/generated/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateUnitData } from "./interface/create-unit.interface";
import { UpdateUnitDTO } from "./dto/update-unit.dto";
import { UnitStatus } from "prisma/generated/enums";

type UnitFilters = {
    propertyId?: number;
    unitNumber?: string;
    status?: UnitStatus;
};

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

    findCoverImageByUnitId(unitId: number): Promise<UnitImage | null> {
        return this.prisma.unitImage.findFirst({
            where: { unitId, isCover: true },
        })
    }

    findImagesByUnitId(unitId: number): Promise<UnitImage[]> {
        return this.prisma.unitImage.findMany({
            where: { unitId },
            orderBy: [{ isCover: 'desc' }, { id: 'asc' }],
        })
    }

    createUnitImages(
        unitId: number,
        images: { imageUrl: string; isCover: boolean }[],
    ): Promise<UnitImage[]> {
        return Promise.all(images.map((image) => this.prisma.unitImage.create({
            data: { unitId, ...image },
        })))
    }

    findImageById(id: number): Promise<UnitImage | null> {
        return this.prisma.unitImage.findUnique({ where: { id } })
    }

    findFirstImageByUnitId(unitId: number): Promise<UnitImage | null> {
        return this.prisma.unitImage.findFirst({
            where: { unitId },
            orderBy: { id: 'asc' },
        })
    }

    updateUnitImage(id: number, data: Partial<UnitImage>): Promise<UnitImage> {
        return this.prisma.unitImage.update({ where: { id }, data })
    }

    deleteUnitImage(id: number): Promise<UnitImage> {
        return this.prisma.unitImage.delete({ where: { id } })
    }

    async setCoverImage(unitId: number, imageId: number): Promise<UnitImage> {
        const [, image] = await this.prisma.$transaction([
            this.prisma.unitImage.updateMany({
                where: { unitId },
                data: { isCover: false },
            }),
            this.prisma.unitImage.update({
                where: { id: imageId },
                data: { isCover: true },
            }),
        ])

        return image
    }

    findAll(filters: UnitFilters = {}): Promise<Unit[]> {
        return this.prisma.unit.findMany({
            where: {
                ...(filters.propertyId !== undefined ? { propertyId: filters.propertyId } : {}),
                ...(filters.unitNumber ? { unitNumber: { contains: filters.unitNumber, mode: 'insensitive' } } : {}),
                ...(filters.status ? { status: filters.status } : {}),
            },
        })
    }

    findPropertyById(id: number): Promise<Property | null> {
        return this.prisma.property.findUnique({ where: { id } })
    }
}
