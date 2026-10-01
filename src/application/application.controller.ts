import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import type { RequestWithUser } from "src/auth/interface/request-with-user.interface";
import { ApplicationService } from "./application.service";
import { ApproveApplicationDTO } from "./dto/approve-application.dto";
import { CreateApplicationDTO } from "./dto/create-application.dto";
import { UpdateApplicationDTO } from "./dto/update-application.dto";

@Controller('api/application')
export class ApplicationController {
    constructor(private readonly applicationService: ApplicationService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Body() dto: CreateApplicationDTO,
        @Req() req: RequestWithUser
    ) {
        return this.applicationService.createApplication(req.user.sub, dto)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateApplicationDTO,
        @Req() req: RequestWithUser
    ) {
        return this.applicationService.updateApplication(Number(id), req.user.sub, dto)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/approve')
    async approve(
        @Param('id') id: string,
        @Body() dto: ApproveApplicationDTO,
        @Req() req: RequestWithUser
    ) {
        return this.applicationService.approveApplication(Number(id), req.user.sub, dto)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/reject')
    async reject(
        @Param('id') id: string,
        @Req() req: RequestWithUser
    ) {
        return this.applicationService.rejectApplication(Number(id), req.user.sub)
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.applicationService.findById(Number(id))
    }

    @Get()
    async findAll() {
        return this.applicationService.findAll()
    }
}
