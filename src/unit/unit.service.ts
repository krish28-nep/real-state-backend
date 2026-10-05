import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UnitRepository } from "./unit.repository";
import { CreateUnitDTO } from "./dto/create-unit.dto";
import { UpdateUnitDTO } from "./dto/update-unit.dto";
import { Unit, UnitImage } from "prisma/generated/client";
import { UploadService } from "src/upload/upload.service";
import { UnitStatus } from "prisma/generated/enums";
import { SearchUnitDTO } from "./dto/search-unit.dto";

@Injectable()
export class UnitService {
    constructor(
        private readonly unitRepository: UnitRepository,
        private readonly uploadService: UploadService,
    ) { }

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

    async findAll(query: SearchUnitDTO = {}): Promise<Unit[]> {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && typeof value !== 'string') {
                throw new BadRequestException(`${key} must be a string`);
            }
        }

        const propertyId = query.propertyId === undefined ? undefined : Number(query.propertyId);
        if (propertyId !== undefined && (!Number.isInteger(propertyId) || propertyId < 1)) {
            throw new BadRequestException('propertyId must be a positive integer');
        }

        if (query.status && !Object.values(UnitStatus).includes(query.status as UnitStatus)) {
            throw new BadRequestException('status must be a valid unit status');
        }

        return this.unitRepository.findAll({
            propertyId,
            unitNumber: query.unitNumber?.trim() || undefined,
            status: query.status as UnitStatus | undefined,
        });
    }

    async findUnitImages(id: number): Promise<UnitImage[]> {
        const unit = await this.unitRepository.findById(id)
        if (!unit) {
            throw new NotFoundException('Unit not found')
        }
        return this.unitRepository.findImagesByUnitId(id)
    }

    async uploadUnitImages(id: number, ownerId: number, files: Express.Multer.File[]): Promise<UnitImage[]> {
        const unit = await this.unitRepository.findById(id)
        if (!unit) {
            throw new NotFoundException('Unit not found')
        }

        if (unit.property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only upload images to your own units')
        }

        const uploadResult = await this.uploadService.uploadImages(files)
        const coverImage = await this.unitRepository.findCoverImageByUnitId(id)

        return this.unitRepository.createUnitImages(
            id,
            uploadResult.images.map((image, index) => ({
                imageUrl: image.url,
                isCover: !coverImage && index === 0,
            })),
        )
    }

    async deleteUnitImage(unitId: number, imageId: number, ownerId: number) {
        const unit = await this.unitRepository.findById(unitId)
        if (!unit) {
            throw new NotFoundException('Unit not found')
        }

        if (unit.property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only delete images from your own units')
        }

        const image = await this.unitRepository.findImageById(imageId)
        if (!image || image.unitId !== unitId) {
            throw new NotFoundException('Unit image not found')
        }

        await this.unitRepository.deleteUnitImage(imageId)
        await this.uploadService.deleteImage(image.imageUrl)

        if (image.isCover) {
            const nextImage = await this.unitRepository.findFirstImageByUnitId(unitId)
            if (nextImage) {
                await this.unitRepository.updateUnitImage(nextImage.id, { isCover: true })
            }
        }

        return { message: 'Unit image deleted successfully' }
    }

    async setUnitCoverImage(unitId: number, imageId: number, ownerId: number): Promise<UnitImage> {
        const unit = await this.unitRepository.findById(unitId)
        if (!unit) {
            throw new NotFoundException('Unit not found')
        }

        if (unit.property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only change images on your own units')
        }

        const image = await this.unitRepository.findImageById(imageId)
        if (!image || image.unitId !== unitId) {
            throw new NotFoundException('Unit image not found')
        }

        return this.unitRepository.setCoverImage(unitId, imageId)
    }
}
