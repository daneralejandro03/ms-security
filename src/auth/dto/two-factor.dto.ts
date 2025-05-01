import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class TwoFactorDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario al que se envió el código 2FA',
        example: 'usuario@ejemplo.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Código de autenticación de dos factores (6 dígitos)',
        example: '123456',
        minLength: 6,
        maxLength: 6,
    })
    @IsString()
    @Length(6, 6)
    code: string;
}
