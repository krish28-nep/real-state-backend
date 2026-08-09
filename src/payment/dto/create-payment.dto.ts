import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { PaymentMethod, PaymentStatus } from "prisma/generated/enums";

export class CreatePaymentDTO {
    @IsNumber()
    leaseId: number;

    @IsNumber()
    amount: number;

    @IsDateString()
    paymentDate: string;

    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsEnum(PaymentStatus)
    paymentStatus: PaymentStatus;

    @IsOptional()
    @IsString()
    transactionId?: string;

    @IsOptional()
    @IsNumber()
    lateFee?: number;
}
