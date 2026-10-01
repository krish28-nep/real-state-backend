import { ApplicationStatus } from "prisma/generated/enums";

export interface UpdateApplicationData {
    unitId?: number;
    message?: string;
    status?: ApplicationStatus;
}
