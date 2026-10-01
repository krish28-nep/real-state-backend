import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { UnitStatus } from "prisma/generated/enums";

export class CreateUnitDTO {
    @IsNumber()
    propertyId: number;

    @IsString()
    unitNumber: string;

    @IsOptional()
    @IsNumber()
    floor?: number;

    @IsOptional()
    @IsNumber()
    bedrooms?: number;

    @IsOptional()
    @IsNumber()
    bathrooms?: number;

    @IsOptional()
    @IsNumber()
    areaSqft?: number;

    @IsNumber()
    rent: number

    @IsEnum(UnitStatus)
    status: UnitStatus
}