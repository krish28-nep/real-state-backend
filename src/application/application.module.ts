import { Module } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { ApplicationController } from "./application.controller";
import { ApplicationRepository } from "./application.repository";
import { ApplicationService } from "./application.service";

@Module({
    imports: [],
    controllers: [ApplicationController],
    providers: [ApplicationService, ApplicationRepository, PrismaService]
})

export class ApplicationModule { }
