import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PaymentMethod, PaymentStatus } from "prisma/generated/enums";

export class UpdatePaymentDTO {
    @IsOptional()
    @IsNumber()
    leaseId?: number;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsDateString()
    paymentDate?: string;

    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;

    @IsOptional()
    @IsEnum(PaymentStatus)
    paymentStatus?: PaymentStatus;

    @IsOptional()
    @IsString()
    transactionId?: string;

    @IsOptional()
    @IsNumber()
    lateFee?: number;
}
