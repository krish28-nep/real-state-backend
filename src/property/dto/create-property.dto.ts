import { IsEnum, IsOptional, IsString } from "class-validator";
import { PropertyStatus, PropertyType } from "prisma/generated/enums";

export class CreatePropertyDTO {
    @IsString()
    title: string

    @IsString()
    description: string

    @IsEnum(PropertyType)
    propertyType: PropertyType

    @IsString()
    address: string

    @IsString()
    city: string

    @IsString()
    country: string

    @IsString()
    state: string

    @IsString()
    postalCode: string

    @IsEnum(PropertyStatus)
    status: PropertyStatus

    @IsOptional()
    @IsString()
    coverImage?: string | null
}
