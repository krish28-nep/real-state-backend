import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import type { RequestWithUser } from "src/auth/interface/request-with-user.interface";
import { CreatePaymentDTO } from "./dto/create-payment.dto";
import { UpdatePaymentDTO } from "./dto/update-payment.dto";
import { PaymentService } from "./payment.service";

@Controller('api/payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Body() dto: CreatePaymentDTO,
        @Req() req: RequestWithUser
    ) {
        return this.paymentService.createPayment(req.user.sub, dto)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePaymentDTO,
        @Req() req: RequestWithUser
    ) {
        return this.paymentService.updatePayment(Number(id), req.user.sub, dto)
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.paymentService.findById(Number(id))
    }

    @Get()
    async findAll() {
        return this.paymentService.findAll()
    }
}
