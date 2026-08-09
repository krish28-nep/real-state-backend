import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { ApplicationStatus } from "prisma/generated/enums";

export class UpdateApplicationDTO {
    @IsOptional()
    @IsNumber()
    unitId?: number;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsEnum(ApplicationStatus)
    status?: ApplicationStatus;
}
