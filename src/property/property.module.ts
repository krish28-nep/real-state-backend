import { Module } from "@nestjs/common";
import { PropertyController } from "./property.controller";
import { PropertyService } from "./property.service";
import { PropertyRepository } from "./property.repository";
import { PrismaService } from "prisma/prisma.service";
import { UploadModule } from "src/upload/upload.module";

@Module({
    imports: [UploadModule],
    controllers: [PropertyController],
    providers: [PropertyService, PropertyRepository, PrismaService]
})

export class PropertyModule{}
