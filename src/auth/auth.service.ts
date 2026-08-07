import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { SafeUser } from './interface/auth-tokens.interface';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interface/jwt-payload.interface';
import { User } from 'prisma/generated/client';

const SALT_ROUNDS = 10;

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: SafeUser;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly authRepository: AuthRepository,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto): Promise<AuthResponse> {
        const existing = await this.authRepository.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException('Email is already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

        const user = await this.authRepository.createUser({
            fullName: dto.fullName,
            email: dto.email,
            phone: dto.phone,
            password: hashedPassword,
            role: dto.role,
        });

        return this.buildAuthResponse(user);
    }

    async login(dto: LoginDto): Promise<AuthResponse> {
        const user = await this.authRepository.findByEmail(dto.email);
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const passwordMatches = await bcrypt.compare(dto.password, user.password);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return this.buildAuthResponse(user);
    }

    async refresh(userId: number): Promise<{ accessToken: string }> {
        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User no longer exists');
        }

        return { accessToken: this.signAccessToken(user) };
    }

    async me(userId: number): Promise<SafeUser> {
        const user = await this.authRepository.findById(userId);
        if (!user) {
            throw new UnauthorizedException();
        }
        return this.sanitizeUser(user);
    }

    private buildAuthResponse(user: User): AuthResponse {
        return {
            accessToken: this.signAccessToken(user),
            refreshToken: this.signRefreshToken(user),
            user: this.sanitizeUser(user),
        };
    }

    private signAccessToken(user: User): string {
        const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
        return this.jwtService.sign(payload);
    }

    private signRefreshToken(user: User): string {
        const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN ?? '7d') as never,
        });
    }

    private sanitizeUser(user: User): SafeUser {
        const { password, ...safeUser } = user;
        return safeUser;
    }
}
