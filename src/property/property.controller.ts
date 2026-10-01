import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { PropertyService } from "./property.service";
import { CreatePropertyDTO } from "./dto/create-property.dto";
import { UpdatePropertyDTO } from "./dto/update-property.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import type { RequestWithUser } from "src/auth/interface/request-with-user.interface";


@Controller('api/property')
export class PropertyController {
    constructor(private readonly propertyService: PropertyService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(
        @Body() dto: CreatePropertyDTO,
        @Req() req: RequestWithUser
    ) {
        return this.propertyService.createProperty(req.user.sub, dto)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdatePropertyDTO,
        @Req() req: RequestWithUser
    ) {
        return this.propertyService.updateProperty(Number(id), req.user.sub, dto)
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/images')
    @UseInterceptors(
        FilesInterceptor('images', 10, {
            limits: {
                fileSize: 10 * 1024 * 1024,
            },
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.startsWith('image/')) {
                    return callback(
                        new Error('Only image files are allowed'),
                        false,
                    );
                }

                callback(null, true);
            },
        }),
    )
    async uploadImages(
        @Param('id') id: string,
        @UploadedFiles() files: Express.Multer.File[],
        @Req() req: RequestWithUser
    ) {
        return this.propertyService.uploadPropertyImages(Number(id), req.user.sub, files)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':propertyId/images/:imageId')
    async deleteImage(
        @Param('propertyId') propertyId: string,
        @Param('imageId') imageId: string,
        @Req() req: RequestWithUser
    ) {
        return this.propertyService.deletePropertyImage(Number(propertyId), Number(imageId), req.user.sub)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':propertyId/images/:imageId/cover')
    async setCoverImage(
        @Param('propertyId') propertyId: string,
        @Param('imageId') imageId: string,
        @Req() req: RequestWithUser
    ) {
        return this.propertyService.setCoverImage(Number(propertyId), Number(imageId), req.user.sub)
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.propertyService.findById(Number(id));
    }

    @Get()
    async findAll(
    ) {
        return this.propertyService.findAll()
    }
}
