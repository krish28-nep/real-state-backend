import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { UnitService } from "./unit.service";
import { CreateUnitDTO } from "./dto/create-unit.dto";
import { UpdateUnitDTO } from "./dto/update-unit.dto";
import { SearchPublicUnitDTO, SearchUnitDTO } from "./dto/search-unit.dto";
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

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req: RequestWithUser) {
        return this.unitService.deleteUnit(Number(id), req.user.sub)
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/images')
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            limits: { fileSize: 10 * 1024 * 1024 },
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.startsWith('image/')) {
                    return callback(new Error('Only image files are allowed'), false)
                }
                callback(null, true)
            },
        }),
    )
    async uploadImages(
        @Param('id') id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Req() req: RequestWithUser,
    ) {
        return this.unitService.uploadUnitImages(Number(id), req.user.sub, files)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':unitId/images/:imageId')
    async deleteImage(
        @Param('unitId') unitId: string,
        @Param('imageId') imageId: string,
        @Req() req: RequestWithUser,
    ) {
        return this.unitService.deleteUnitImage(Number(unitId), Number(imageId), req.user.sub)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':unitId/images/:imageId/cover')
    async setCoverImage(
        @Param('unitId') unitId: string,
        @Param('imageId') imageId: string,
        @Req() req: RequestWithUser,
    ) {
        return this.unitService.setUnitCoverImage(Number(unitId), Number(imageId), req.user.sub)
    }

    @Get('public')
    async findPublic(@Query() query: SearchPublicUnitDTO) {
        return this.unitService.findPublic(query)
    }

    @Get(':id/images')
    async getImages(@Param('id') id: string) {
        return this.unitService.findUnitImages(Number(id))
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.unitService.findById(Number(id))
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@Query() query: SearchUnitDTO, @Req() req: RequestWithUser) {
        return this.unitService.findAll(req.user.sub, query)
    }
}
