import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { UnitStatus } from "prisma/generated/enums";

export class UpdateUnitDTO {
    @IsOptional()
    @IsNumber()
    propertyId?: number;

    @IsOptional()
    @IsString()
    unitNumber?: string;

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

    @IsOptional()
    @IsNumber()
    rent?: number

    @IsOptional()
    @IsEnum(UnitStatus)
    status?: UnitStatus
}
