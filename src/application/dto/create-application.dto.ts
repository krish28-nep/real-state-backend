import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateApplicationDTO {
    @IsNumber()
    unitId: number;

    @IsOptional()
    @IsString()
    message?: string;
}
