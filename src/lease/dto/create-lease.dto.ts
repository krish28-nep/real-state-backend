import { IsDateString, IsEnum, IsNumber } from "class-validator";
import { LeaseStatus } from "prisma/generated/enums";

export class CreateLeaseDTO {
    @IsNumber()
    tenantId: number;

    @IsNumber()
    unitId: number;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;

    @IsNumber()
    monthlyRent: number;

    @IsNumber()
    securityDeposit: number;

    @IsEnum(LeaseStatus)
    leaseStatus: LeaseStatus;
}
