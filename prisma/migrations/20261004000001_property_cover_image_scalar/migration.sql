-- Store the property's single cover image directly on Property.
ALTER TABLE "Property" ADD COLUMN "coverImage" TEXT;

-- Preserve each property's current cover image, falling back to its first image.
UPDATE "Property" AS property
SET "coverImage" = (
    SELECT image."imageUrl"
    FROM "PropertyImage" AS image
    WHERE image."propertyId" = property."id"
    ORDER BY image."isCover" DESC, image."id" ASC
    LIMIT 1
);

-- Unit images remain in UnitImage; property gallery records are no longer used.
DROP TABLE "PropertyImage";
