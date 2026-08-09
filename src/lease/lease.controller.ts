import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import type { RequestWithUser } from "src/auth/interface/request-with-user.interface";
import { CreateLeaseDTO } from "./dto/create-lease.dto";
import { UpdateLeaseDTO } from "./dto/update-lease.dto";
import { LeaseService } from "./lease.service";

@Controller('api/lease')
export class LeaseController {
    constructor(private readonly leaseService: LeaseService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Body() dto: CreateLeaseDTO,
        @Req() req: RequestWithUser
    ) {
        return this.leaseService.createLease(req.user.sub, dto)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateLeaseDTO,
        @Req() req: RequestWithUser
    ) {
        return this.leaseService.updateLease(Number(id), req.user.sub, dto)
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.leaseService.findById(Number(id))
    }

    @Get()
    async findAll() {
        return this.leaseService.findAll()
    }
}
