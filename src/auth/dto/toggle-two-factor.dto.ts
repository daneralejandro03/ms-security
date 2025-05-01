import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsBoolean } from 'class-validator';

export class ToggleTwoFactorDto {
    @ApiProperty({
        description: 'Correo electrónico asociado a la cuenta del usuario',
        example: 'usuario@ejemplo.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Indicador para habilitar (true) o deshabilitar (false) 2FA',
        example: true,
        type: Boolean,
    })
    @IsBoolean()
    enable: boolean;
}
