import { PropertyStatus, PropertyType } from "prisma/generated/enums";

export interface createPropertyData {
    ownerId: number;
    title: string;
    description: string;
    propertyType: PropertyType;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string
    status: PropertyStatus
    coverImage?: string | null
}
