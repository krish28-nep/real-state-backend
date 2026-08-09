import { PaymentMethod, PaymentStatus } from "prisma/generated/enums";

export interface CreatePaymentData {
    leaseId: number;
    amount: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    transactionId?: string;
    lateFee?: number;
}
