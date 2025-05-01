import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        description: 'Correo electrónico asociado a la cuenta',
        example: 'usuario@ejemplo.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Contraseña actual del usuario (mínimo 6 caracteres)',
        example: 'AntiguaPass123',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    oldPassword: string;

    @ApiProperty({
        description: 'Nueva contraseña que reemplazará a la anterior (mínimo 6 caracteres)',
        example: 'NuevaPass456',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    newPassword: string;
}
