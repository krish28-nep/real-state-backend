import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { createPropertyData } from "./interface/create-property.interface";
import { UpdatePropertyDTO } from "./dto/update-property.dto";
import { Property, PropertyImage } from "prisma/generated/client";

@Injectable()
export class PropertyRepository {
    constructor(private readonly prisma: PrismaService) { }

    createProperty(data: createPropertyData): Promise<Property> {
        return this.prisma.property.create({ data })
    }

    updateProperty(id: number, data: UpdatePropertyDTO): Promise<Property> {
        return this.prisma.property.update({ where: { id }, data })
    }

    findById(id: number): Promise<Property | null> {
        return this.prisma.property.findUnique({ where: { id } })
    }

    findAll(): Promise<Property[]> {
        return this.prisma.property.findMany()
    }

    findCoverImageByPropertyId(propertyId: number): Promise<PropertyImage | null> {
        return this.prisma.propertyImage.findFirst({
            where: {
                propertyId,
                isCover: true
            }
        })
    }

    createPropertyImages(
        propertyId: number,
        images: { imageUrl: string; isCover: boolean }[]
    ): Promise<PropertyImage[]> {
        return Promise.all(
            images.map((image) =>
                this.prisma.propertyImage.create({
                    data: {
                        propertyId,
                        imageUrl: image.imageUrl,
                        isCover: image.isCover
                    }
                })
            )
        )
    }

    findImageById(id: number): Promise<PropertyImage | null> {
        return this.prisma.propertyImage.findUnique({ where: { id } })
    }

    findFirstImageByPropertyId(propertyId: number): Promise<PropertyImage | null> {
        return this.prisma.propertyImage.findFirst({
            where: { propertyId },
            orderBy: { id: 'asc' }
        })
    }

    updatePropertyImage(id: number, data: Partial<PropertyImage>): Promise<PropertyImage> {
        return this.prisma.propertyImage.update({ where: { id }, data })
    }

    deletePropertyImage(id: number): Promise<PropertyImage> {
        return this.prisma.propertyImage.delete({ where: { id } })
    }

    async setCoverImage(propertyId: number, imageId: number): Promise<PropertyImage> {
        const [, image] = await this.prisma.$transaction([
            this.prisma.propertyImage.updateMany({
                where: { propertyId },
                data: { isCover: false }
            }),
            this.prisma.propertyImage.update({
                where: { id: imageId },
                data: { isCover: true }
            })
        ])

        return image
    }
}
