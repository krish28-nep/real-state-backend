import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const REFRESH_COOKIE_NAME = 'refreshToken';

const REFRESH_COOKIE_PATH = '/auth/refresh';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(
        @Body() dto: RegisterDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { accessToken, refreshToken, user } = await this.authService.register(dto);
        this.setRefreshCookie(res, refreshToken);
        return { accessToken, user };
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() dto: LoginDto,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { accessToken, refreshToken, user } = await this.authService.login(dto);
        this.setRefreshCookie(res, refreshToken);
        return { accessToken, user };
    }

    @UseGuards(JwtRefreshGuard)
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    async refresh(@Req() req) {
        return this.authService.refresh(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Req() req) {
        return this.authService.me(req.user.sub);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
        return { message: 'Logged out successfully' };
    }

    private setRefreshCookie(res: Response, refreshToken: string) {
        res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: REFRESH_COOKIE_PATH,
            maxAge: REFRESH_COOKIE_MAX_AGE_MS,
        });
    }
}
