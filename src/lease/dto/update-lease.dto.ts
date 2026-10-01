import { IsDateString, IsEnum, IsNumber, IsOptional } from "class-validator";
import { LeaseStatus } from "prisma/generated/enums";

export class UpdateLeaseDTO {
    @IsOptional()
    @IsNumber()
    tenantId?: number;

    @IsOptional()
    @IsNumber()
    unitId?: number;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsNumber()
    monthlyRent?: number;

    @IsOptional()
    @IsNumber()
    securityDeposit?: number;

    @IsOptional()
    @IsEnum(LeaseStatus)
    leaseStatus?: LeaseStatus;
}
