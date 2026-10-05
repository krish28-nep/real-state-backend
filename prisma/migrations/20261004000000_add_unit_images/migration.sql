-- CreateTable
CREATE TABLE "UnitImage" (
    "id" SERIAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isCover" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UnitImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UnitImage_unitId_idx" ON "UnitImage"("unitId");

-- AddForeignKey
ALTER TABLE "UnitImage" ADD CONSTRAINT "UnitImage_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Keep at most one cover image for each property and each unit.
WITH ranked_property_covers AS (
    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "propertyId" ORDER BY "id") AS "position"
    FROM "PropertyImage"
    WHERE "isCover" = true
)
UPDATE "PropertyImage"
SET "isCover" = false
FROM ranked_property_covers
WHERE "PropertyImage"."id" = ranked_property_covers."id"
  AND ranked_property_covers."position" > 1;

CREATE UNIQUE INDEX "PropertyImage_one_cover_per_property"
ON "PropertyImage"("propertyId")
WHERE "isCover" = true;

CREATE UNIQUE INDEX "UnitImage_one_cover_per_unit"
ON "UnitImage"("unitId")
WHERE "isCover" = true;
