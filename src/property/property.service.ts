import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PropertyRepository } from "./property.repository";
import { CreatePropertyDTO } from "./dto/create-property.dto";
import { UpdatePropertyDTO } from "./dto/update-property.dto";
import { Property, PropertyImage } from "prisma/generated/client";
import { UploadService } from "src/upload/upload.service";
import multer from 'multer';

@Injectable()
export class PropertyService {
    constructor(
        private readonly propertyRepository: PropertyRepository,
        private readonly uploadService: UploadService
    ) { }

    async createProperty(ownerId: number, dto: CreatePropertyDTO): Promise<Property> {
        return this.propertyRepository.createProperty({
            ownerId,
            ...dto,
        })
    }

    async updateProperty(id: number, ownerId: number, dto: UpdatePropertyDTO): Promise<Property> {
        const property = await this.propertyRepository.findById(id)
        if (!property) {
            throw new NotFoundException('Property not found')
        }

        if (property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only update your own property')
        }

        return this.propertyRepository.updateProperty(id, dto)
    }

    async uploadPropertyImages(id: number, ownerId: number, files: Express.Multer.File[]): Promise<PropertyImage[]> {
        const property = await this.propertyRepository.findById(id)
        if (!property) {
            throw new NotFoundException('Property not found')
        }

        if (property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only upload images to your own property')
        }

        const uploadResult = await this.uploadService.uploadImages(files)
        const coverImage = await this.propertyRepository.findCoverImageByPropertyId(id)

        return this.propertyRepository.createPropertyImages(
            id,
            uploadResult.images.map((image, index) => ({
                imageUrl: image.url,
                isCover: !coverImage && index === 0
            }))
        )
    }

    async deletePropertyImage(propertyId: number, imageId: number, ownerId: number) {
        const property = await this.propertyRepository.findById(propertyId)
        if (!property) {
            throw new NotFoundException('Property not found')
        }

        if (property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only delete images from your own property')
        }

        const image = await this.propertyRepository.findImageById(imageId)
        if (!image || image.propertyId !== propertyId) {
            throw new NotFoundException('Image not found')
        }

        await this.propertyRepository.deletePropertyImage(imageId)
        await this.uploadService.deleteImage(image.imageUrl)

        if (image.isCover) {
            const nextImage = await this.propertyRepository.findFirstImageByPropertyId(propertyId)

            if (nextImage) {
                await this.propertyRepository.updatePropertyImage(nextImage.id, {
                    isCover: true
                })
            }
        }

        return {
            message: 'Image deleted successfully'
        }
    }

    async setCoverImage(propertyId: number, imageId: number, ownerId: number): Promise<PropertyImage> {
        const property = await this.propertyRepository.findById(propertyId)
        if (!property) {
            throw new NotFoundException('Property not found')
        }

        if (property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only update images from your own property')
        }

        const image = await this.propertyRepository.findImageById(imageId)
        if (!image || image.propertyId !== propertyId) {
            throw new NotFoundException('Image not found')
        }

        return this.propertyRepository.setCoverImage(propertyId, imageId)
    }

    async findById(id: number): Promise<Property | null> {
        return this.propertyRepository.findById(id)
    }

    async findAll(): Promise<Property[]> {
        return this.propertyRepository.findAll()
    }
}
