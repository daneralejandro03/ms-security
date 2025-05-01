import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsBoolean, IsNumber, IsOptional, IsDate, MinLength } from 'class-validator';

export class RegisterUserDto {

    @ApiProperty({
        description: 'Nombre(s) del usuario',
        example: 'Daner',
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiPropertyOptional({
        description: 'Segundo nombre del usuario (opcional)',
        example: 'Alejandro',
    })
    @IsString()
    @IsOptional()
    secondName?: string;

    @ApiProperty({
        description: 'Primer apellido del usuario',
        example: 'Salazar',
    })
    @IsString()
    @IsNotEmpty()
    firstLastName: string;

    @ApiPropertyOptional({
        description: 'Segundo apellido del usuario (opcional)',
        example: 'Colorado',
    })
    @IsString()
    @IsOptional()
    secondLastName?: string;

    @ApiProperty({
        description: 'Género del usuario',
        example: 'Masculino',
    })
    @IsString()
    @IsNotEmpty()
    gender: string;

    @ApiProperty({
        description: 'Correo electrónico único del usuario',
        example: 'usuario@gmail.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Contraseña (mínimo 6 caracteres)',
        example: '123456789',
        minLength: 6,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({
        description: 'Número de celular (para Twilio SMS) este numero es obligatorio',
        example: 573145919465,
    })
    @IsNumber()
    @IsNotEmpty()
    cellPhone: number;

    @ApiPropertyOptional({
        description: 'Teléfono fijo (opcional)',
        example: 3456789,
    })
    @IsNumber()
    @IsOptional()
    landline?: number;

    @ApiProperty({
        description: 'Tipo de identificación',
        example: 'CC',
    })
    @IsString()
    @IsNotEmpty()
    IDType: string;

    @ApiProperty({
        description: 'Número de identificación',
        example: '100xxxxxxx',
    })
    @IsString()
    @IsNotEmpty()
    IDNumber: string;

    // Campos opcionales para verificación y 2FA
    @IsString()
    @IsOptional()
    verificationCode?: string;

    @IsDate()
    @IsOptional()
    verificationCodeExpires?: Date;

    @IsString()
    @IsOptional()
    twoFactorCode?: string;

    @IsDate()
    @IsOptional()
    twoFactorCodeExpires?: Date;

    @IsBoolean()
    @IsOptional()
    requiresTwoFactor?: boolean;

}
