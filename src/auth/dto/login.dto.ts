import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario',
        example: 'usuario@ejemplo.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'MiContraseñaSegura123!',
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiPropertyOptional({
        description: 'Método para enviar código 2FA (email o sms)',
        example: 'sms',
        enum: ['email', 'sms'],
    })
    @IsOptional()
    @IsIn(['email', 'sms'])
    twoFactorMethod?: 'email' | 'sms';
}
