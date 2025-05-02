import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString, IsNotEmpty, IsEmail, IsBoolean, IsNumber, IsOptional, IsDate, Length,
    IsNumberString, IsIn, Matches
} from 'class-validator';

export class CreateUserDto {

    @ApiProperty({
        description: 'Nombre(s) del usuario',
        example: 'Daner',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'Primer apellido del usuario',
        example: 'Salazar',
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        description: "Género del usuario",
        example: 'Masculino',
        enum: ['Femenino', 'Masculino', 'Otro'],
    })
    @IsString()
    @IsNotEmpty()
    @IsIn(['Femenino', 'Masculino', 'Otro'], { message: 'El género debe ser Femenino, Masculino u Otro' })
    gender: string;

    @ApiProperty({
        description: 'Correo electrónico único del usuario',
        example: 'usuario@gmail.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;


    @ApiProperty({
        description: 'Contraseña fuerte (mínimo 8 caracteres, incluye mayúsculas, minúsculas, números y caracteres especiales)',
        example: 'Str0ngP@ssw0rd!',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, {
        message: 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales',
    })
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

    @IsNumberString({}, { message: 'El número de identificación debe contener solo dígitos' })
    @Length(7, 10, { message: 'El número de identificación debe tener entre 7 y 10 dígitos' })
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

    @ApiProperty({
        description: 'ID del rol asignado al usuario',
        example: '680ee3e85c022987822c83da',
    })
    @IsString()
    @IsNotEmpty()
    readonly role: string;
}


