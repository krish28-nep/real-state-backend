import { IsDateString, IsEnum, IsNumber } from "class-validator";
import { LeaseStatus } from "prisma/generated/enums";

export class ApproveApplicationDTO {
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
