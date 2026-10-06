import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { createPropertyData } from "./interface/create-property.interface";
import { UpdatePropertyDTO } from "./dto/update-property.dto";
import { Property } from "prisma/generated/client";
import { PropertyStatus, PropertyType } from "prisma/generated/enums";

type PropertyFilters = {
    title?: string;
    ownerId?: number;
    status?: PropertyStatus;
    propertyType?: PropertyType;
};

@Injectable()
export class PropertyRepository {
    constructor(private readonly prisma: PrismaService) { }

    createProperty(data: createPropertyData): Promise<Property> {
        return this.prisma.property.create({ data })
    }

    updateProperty(id: number, data: UpdatePropertyDTO): Promise<Property> {
        return this.prisma.property.update({ where: { id }, data })
    }

    countUnits(propertyId: number): Promise<number> {
        return this.prisma.unit.count({ where: { propertyId } });
    }

    deleteProperty(id: number): Promise<Property> {
        return this.prisma.property.delete({ where: { id } });
    }

    findById(id: number): Promise<Property | null> {
        return this.prisma.property.findUnique({ where: { id } })
    }

    findAll(filters: PropertyFilters = {}): Promise<Property[]> {
        return this.prisma.property.findMany({
            where: {
                ...(filters.title ? { title: { contains: filters.title, mode: 'insensitive' } } : {}),
                ...(filters.ownerId !== undefined ? { ownerId: filters.ownerId } : {}),
                ...(filters.status ? { status: filters.status } : {}),
                ...(filters.propertyType ? { propertyType: filters.propertyType } : {}),
            },
        })
    }

    async findPage(filters: PropertyFilters, page: number, pageSize: number) {
        const where = {
            ...(filters.title ? { title: { contains: filters.title, mode: 'insensitive' as const } } : {}),
            ...(filters.ownerId !== undefined ? { ownerId: filters.ownerId } : {}),
            ...(filters.status ? { status: filters.status } : {}),
            ...(filters.propertyType ? { propertyType: filters.propertyType } : {}),
        };
        const [items, total] = await this.prisma.$transaction([
            this.prisma.property.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, orderBy: { id: 'desc' } }),
            this.prisma.property.count({ where }),
        ]);
        return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    }

    updateCoverImage(id: number, coverImage: string): Promise<Property> {
        return this.prisma.property.update({
            where: { id },
            data: { coverImage },
        })
    }
}
