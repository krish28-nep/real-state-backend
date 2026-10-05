import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
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

    async findAll(query: SearchPropertyDTO = {}): Promise<Property[]> {
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

        return this.propertyRepository.findAll({
            title,
            ownerId,
            status: query.status as PropertyStatus | undefined,
            propertyType: query.propertyType as PropertyType | undefined,
        });
    }
}
