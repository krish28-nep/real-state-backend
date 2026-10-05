import { Body, Controller, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { PropertyService } from "./property.service";
import { CreatePropertyDTO } from "./dto/create-property.dto";
import { UpdatePropertyDTO } from "./dto/update-property.dto";
import { SearchPropertyDTO } from "./dto/search-property.dto";
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
    @Post(':id/cover-image')
    @UseInterceptors(
        FileInterceptor('image', {
            limits: { fileSize: 10 * 1024 * 1024 },
            fileFilter: (req, file, callback) => {
                if (!file.mimetype.startsWith('image/')) {
                    return callback(new Error('Only image files are allowed'), false);
                }
                callback(null, true);
            },
        }),
    )
    async uploadCoverImage(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: RequestWithUser
    ) {
        return this.propertyService.uploadCoverImage(Number(id), req.user.sub, file)
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.propertyService.findById(Number(id));
    }

    @Get()
    async findAll(@Query() query: SearchPropertyDTO) {
        return this.propertyService.findAll(query)
    }
}
