import { IsEnum, IsOptional, IsString } from "class-validator";
import { PropertyStatus, PropertyType } from "prisma/generated/enums";

export class UpdatePropertyDTO {
    @IsOptional()
    @IsString()
    title?: string

    @IsOptional()
    @IsString()
    description?: string

    @IsOptional()
    @IsEnum(PropertyType)
    propertyType?: PropertyType

    @IsOptional()
    @IsString()
    address?: string

    @IsOptional()
    @IsString()
    city?: string

    @IsOptional()
    @IsString()
    country?: string

    @IsOptional()
    @IsString()
    state?: string

    @IsOptional()
    @IsString()
    postalCode?: string

    @IsOptional()
    @IsEnum(PropertyStatus)
    status?: PropertyStatus

    @IsOptional()
    @IsString()
    coverImage?: string | null
}
