import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PropertyRepository } from "./property.repository";
import { CreatePropertyDTO } from "./dto/create-property.dto";
import { UpdatePropertyDTO } from "./dto/update-property.dto";
import { Property } from "prisma/generated/client";
import { UploadService } from "src/upload/upload.service";
import { PropertyStatus, PropertyType } from "prisma/generated/enums";
import { SearchPropertyDTO } from "./dto/search-property.dto";

@Injectable()
export class PropertyService {
    constructor(
        private readonly propertyRepository: PropertyRepository,
        private readonly uploadService: UploadService,
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

    async deleteProperty(id: number, ownerId: number) {
        const property = await this.propertyRepository.findById(id);
        if (!property) throw new NotFoundException('Property not found');
        if (property.ownerId !== ownerId) throw new ForbiddenException('You can only delete your own property');
        if (await this.propertyRepository.countUnits(id)) {
            throw new ConflictException('Delete this property’s units before deleting the property');
        }

        await this.propertyRepository.deleteProperty(id);
        if (property.coverImage?.startsWith('/uploads/')) {
            await this.uploadService.deleteImage(property.coverImage).catch(() => undefined);
        }
        return { message: 'Property deleted successfully' };
    }

    async uploadCoverImage(id: number, ownerId: number, file: Express.Multer.File): Promise<Property> {
        const property = await this.propertyRepository.findById(id)
        if (!property) {
            throw new NotFoundException('Property not found')
        }

        if (property.ownerId !== ownerId) {
            throw new ForbiddenException('You can only update your own property')
        }

        const uploaded = await this.uploadService.uploadImage(file)
        const updatedProperty = await this.propertyRepository.updateCoverImage(id, uploaded.url)

        if (property.coverImage?.startsWith('/uploads/')) {
            await this.uploadService.deleteImage(property.coverImage)
        }

        return updatedProperty
    }

    async findById(id: number): Promise<Property | null> {
        return this.propertyRepository.findById(id)
    }

    async findAll(query: SearchPropertyDTO = {}) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && typeof value !== 'string') {
                throw new BadRequestException(`${key} must be a string`);
            }
        }

        const title = query.title?.trim() || undefined;
        const ownerId = query.ownerId === undefined ? undefined : Number(query.ownerId);

        if (ownerId !== undefined && (!Number.isInteger(ownerId) || ownerId < 1)) {
            throw new BadRequestException('ownerId must be a positive integer');
        }

        if (query.status && !Object.values(PropertyStatus).includes(query.status as PropertyStatus)) {
            throw new BadRequestException('status must be a valid property status');
        }

        if (query.propertyType && !Object.values(PropertyType).includes(query.propertyType as PropertyType)) {
            throw new BadRequestException('propertyType must be a valid property type');
        }

        const page = this.parsePositiveInteger(query.page, 'page');
        const pageSize = this.parsePositiveInteger(query.pageSize, 'pageSize');
        if ((page === undefined) !== (pageSize === undefined)) {
            throw new BadRequestException('page and pageSize must be provided together');
        }

        const filters = {
            title,
            ownerId,
            status: query.status as PropertyStatus | undefined,
            propertyType: query.propertyType as PropertyType | undefined,
        };
        return page !== undefined && pageSize !== undefined
            ? this.propertyRepository.findPage(filters, page, pageSize)
            : this.propertyRepository.findAll(filters);
    }

    private parsePositiveInteger(value: string | undefined, field: string): number | undefined {
        if (value === undefined) return undefined;
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 1 || (field === 'pageSize' && parsed > 100)) {
            throw new BadRequestException(`${field} must be a positive integer${field === 'pageSize' ? ' no greater than 100' : ''}`);
        }
        return parsed;
    }
}
