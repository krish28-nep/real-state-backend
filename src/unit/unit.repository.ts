import { Injectable } from "@nestjs/common";
import { Property, Unit, UnitImage } from "prisma/generated/client";
import { PrismaService } from "prisma/prisma.service";
import { CreateUnitData } from "./interface/create-unit.interface";
import { UpdateUnitDTO } from "./dto/update-unit.dto";
import { UnitStatus } from "prisma/generated/enums";
import { PropertyType } from "prisma/generated/enums";

type UnitFilters = {
    ownerId: number;
    propertyId?: number;
    unitNumber?: string;
    status?: UnitStatus;
};

type PublicUnitFilters = {
    propertyId?: number;
    search?: string;
    propertyTypes?: PropertyType[];
    maxRent?: number;
    bedroomsMin?: number;
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

    async findDeleteConstraints(id: number) {
        return this.prisma.unit.findUnique({
            where: { id },
            select: { _count: { select: { leases: true, applications: true } } },
        });
    }

    async deleteUnit(id: number): Promise<string[]> {
        const images = await this.prisma.unitImage.findMany({ where: { unitId: id }, select: { imageUrl: true } });
        await this.prisma.$transaction(async (transaction) => {
            await transaction.unitImage.deleteMany({ where: { unitId: id } });
            await transaction.unit.delete({ where: { id } });
        });
        return images.map((image) => image.imageUrl);
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

    findAll(filters: UnitFilters): Promise<Unit[]> {
        return this.prisma.unit.findMany({
            where: {
                property: { ownerId: filters.ownerId },
                ...(filters.propertyId !== undefined ? { propertyId: filters.propertyId } : {}),
                ...(filters.unitNumber ? { unitNumber: { contains: filters.unitNumber, mode: 'insensitive' } } : {}),
                ...(filters.status ? { status: filters.status } : {}),
            },
        })
    }

    async findPage(filters: UnitFilters, page: number, pageSize: number) {
        const where = {
            property: { ownerId: filters.ownerId },
            ...(filters.propertyId !== undefined ? { propertyId: filters.propertyId } : {}),
            ...(filters.unitNumber ? { unitNumber: { contains: filters.unitNumber, mode: 'insensitive' as const } } : {}),
            ...(filters.status ? { status: filters.status } : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.unit.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { id: 'desc' } }),
            this.prisma.unit.count({ where }),
        ]);
        return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    async findPublicPage(filters: PublicUnitFilters, page: number, pageSize: number) {
        const where = {
            status: UnitStatus.AVAILABLE,
            ...(filters.maxRent !== undefined ? { rent: { lte: filters.maxRent } } : {}),
            ...(filters.bedroomsMin !== undefined ? { bedrooms: { gte: filters.bedroomsMin } } : {}),
            property: {
                ...(filters.propertyId !== undefined ? { id: filters.propertyId } : {}),
                ...(filters.propertyTypes?.length ? { propertyType: { in: filters.propertyTypes } } : {}),
                ...(filters.search ? {
                    OR: [
                        { title: { contains: filters.search, mode: 'insensitive' as const } },
                        { city: { contains: filters.search, mode: 'insensitive' as const } },
                        { address: { contains: filters.search, mode: 'insensitive' as const } },
                    ],
                } : {}),
            },
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.unit.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { id: 'desc' },
                include: {
                    property: { select: { id: true, title: true, propertyType: true, address: true, city: true, state: true, coverImage: true } },
                    images: { where: { isCover: true }, take: 1, orderBy: { id: 'asc' } },
                },
            }),
            this.prisma.unit.count({ where }),
        ]);
        return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    findPropertyById(id: number): Promise<Property | null> {
        return this.prisma.property.findUnique({ where: { id } })
    }
}
