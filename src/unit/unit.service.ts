import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UnitRepository } from "./unit.repository";
import { CreateUnitDTO } from "./dto/create-unit.dto";
import { UpdateUnitDTO } from "./dto/update-unit.dto";
import { Unit, UnitImage } from "prisma/generated/client";
import { UploadService } from "src/upload/upload.service";
import { PropertyType, UnitStatus } from "prisma/generated/enums";
import { SearchPublicUnitDTO, SearchUnitDTO } from "./dto/search-unit.dto";

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

    async deleteUnit(id: number, ownerId: number) {
        const unit = await this.unitRepository.findById(id);
        if (!unit) throw new NotFoundException('Unit not found');
        if (unit.property.ownerId !== ownerId) throw new ForbiddenException('You can only delete your own units');

        const constraints = await this.unitRepository.findDeleteConstraints(id);
        if (constraints?._count.leases || constraints?._count.applications) {
            throw new ConflictException('This unit has leases or applications and cannot be deleted');
        }

        const imageUrls = await this.unitRepository.deleteUnit(id);
        await Promise.allSettled(imageUrls.map((url) => this.uploadService.deleteImage(url)));
        return { message: 'Unit deleted successfully' };
    }

    async findById(id: number): Promise<Unit | null> {
        return this.unitRepository.findById(id)
    }

    async findAll(ownerId: number, query: SearchUnitDTO = {}) {
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

        const page = this.parsePositiveInteger(query.page, 'page');
        const pageSize = this.parsePositiveInteger(query.pageSize, 'pageSize');
        if ((page === undefined) !== (pageSize === undefined)) {
            throw new BadRequestException('page and pageSize must be provided together');
        }

        const filters = {
            ownerId,
            propertyId,
            unitNumber: query.unitNumber?.trim() || undefined,
            status: query.status as UnitStatus | undefined,
        };
        return page !== undefined && pageSize !== undefined
            ? this.unitRepository.findPage(filters, page, pageSize)
            : this.unitRepository.findAll(filters);
    }

    private parsePositiveInteger(value: string | undefined, field: string): number | undefined {
        if (value === undefined) return undefined;
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 1 || (field === 'pageSize' && parsed > 100)) {
            throw new BadRequestException(`${field} must be a positive integer${field === 'pageSize' ? ' no greater than 100' : ''}`);
        }
        return parsed;
    }

    async findPublic(query: SearchPublicUnitDTO) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && typeof value !== 'string') {
                throw new BadRequestException(`${key} must be a string`);
            }
        }

        const requestedTypes = query.propertyTypes?.split(',').map((value) => value.trim()).filter(Boolean) ?? [];
        const validTypes = Object.values(PropertyType) as string[];
        if (requestedTypes.some((type) => !validTypes.includes(type))) {
            throw new BadRequestException('propertyTypes must contain valid property types');
        }

        const maxRent = query.maxRent === undefined || query.maxRent === '' ? undefined : Number(query.maxRent);
        if (maxRent !== undefined && (!Number.isFinite(maxRent) || maxRent < 0)) {
            throw new BadRequestException('maxRent must be a non-negative number');
        }
        const bedroomsMin = query.bedroomsMin === undefined || query.bedroomsMin === '' ? undefined : Number(query.bedroomsMin);
        if (bedroomsMin !== undefined && (!Number.isInteger(bedroomsMin) || bedroomsMin < 0)) {
            throw new BadRequestException('bedroomsMin must be a non-negative integer');
        }

        const page = this.parsePositiveInteger(query.page, 'page') ?? 1;
        const pageSize = this.parsePositiveInteger(query.pageSize, 'pageSize') ?? 9;
        if (pageSize > 100) throw new BadRequestException('pageSize must be no greater than 100');
        const propertyId = query.propertyId === undefined ? undefined : Number(query.propertyId);
        if (propertyId !== undefined && (!Number.isInteger(propertyId) || propertyId < 1)) {
            throw new BadRequestException('propertyId must be a positive integer');
        }

        return this.unitRepository.findPublicPage({
            propertyId,
            search: query.search?.trim() || undefined,
            propertyTypes: requestedTypes as PropertyType[],
            maxRent: maxRent || undefined,
            bedroomsMin: bedroomsMin || undefined,
        }, page, pageSize);
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
