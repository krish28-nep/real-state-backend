import { Module } from "@nestjs/common";
import { UnitController } from "./unit.controller";
import { UnitService } from "./unit.service";
import { UnitRepository } from "./unit.repository";
import { PrismaService } from "prisma/prisma.service";
import { UploadModule } from "src/upload/upload.module";

@Module({
    imports: [UploadModule],
    controllers: [UnitController],
    providers: [UnitService, UnitRepository, PrismaService]
})

export class UnitModule { }
