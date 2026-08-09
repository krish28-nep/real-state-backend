import { LeaseStatus } from "prisma/generated/enums";

export interface CreateLeaseData {
    tenantId: number;
    unitId: number;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    leaseStatus: LeaseStatus;
}
