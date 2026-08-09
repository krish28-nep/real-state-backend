import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { UnitService } from "./unit.service";
import { CreateUnitDTO } from "./dto/create-unit.dto";
import { UpdateUnitDTO } from "./dto/update-unit.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import type { RequestWithUser } from "src/auth/interface/request-with-user.interface";

@Controller('api/unit')
export class UnitController {
    constructor(private readonly unitService: UnitService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Body() dto: CreateUnitDTO,
        @Req() req: RequestWithUser
    ) {
        return this.unitService.createUnit(req.user.sub, dto)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateUnitDTO,
        @Req() req: RequestWithUser
    ) {
        return this.unitService.updateUnit(Number(id), req.user.sub, dto)
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.unitService.findById(Number(id))
    }

    @Get()
    async findAll() {
        return this.unitService.findAll()
    }
}
