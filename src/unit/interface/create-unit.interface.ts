import { UnitStatus } from "prisma/generated/enums";

export interface CreateUnitData {
  propertyId: number;
  unitNumber: string;
  floor?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  rent: number;
  status: UnitStatus;
}
