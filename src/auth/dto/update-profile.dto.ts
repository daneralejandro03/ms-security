import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsOptional,
    IsIn,
    IsNumber,
    Length,
    IsNumberString,
} from 'class-validator';

export class UpdateProfileDto {
    @ApiPropertyOptional({ description: 'Nombre(s)', example: 'Karen' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Apellido(s)', example: 'Agudelo' })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional({ description: 'Género', enum: ['Femenino', 'Masculino', 'Otro'] })
    @IsOptional()
    @IsString()
    @IsIn(['Femenino', 'Masculino', 'Otro'])
    gender?: string;

    @ApiPropertyOptional({ description: 'Celular', example: 3001234567 })
    @IsOptional()
    @IsNumber()
    cellPhone?: number;

    @ApiPropertyOptional({ description: 'Teléfono fijo', example: 3456789 })
    @IsOptional()
    @IsNumber()
    landline?: number;

    @ApiPropertyOptional({ description: 'Tipo de identificación', enum: ['RC', 'TI', 'CC', 'C', 'DE'] })
    @IsOptional()
    @IsString()
    @IsIn(['RC', 'TI', 'CC', 'C', 'DE'])
    IDType?: string;

    @ApiPropertyOptional({ description: 'Número de identificación', example: '1001234567' })
    @IsOptional()
    @IsNumberString({}, { message: 'Solo dígitos' })
    @Length(7, 10)
    IDNumber?: string;
}
