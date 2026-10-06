export class SearchUnitDTO {
    propertyId?: string;
    unitNumber?: string;
    status?: string;
    page?: string;
    pageSize?: string;
}

export class SearchPublicUnitDTO {
    propertyId?: string;
    search?: string;
    propertyTypes?: string;
    maxRent?: string;
    bedroomsMin?: string;
    page?: string;
    pageSize?: string;
}
