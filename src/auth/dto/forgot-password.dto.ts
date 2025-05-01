import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
    @ApiProperty({
        description: 'Correo electrónico registrado en el sistema donde se enviará el enlace de restablecimiento',
        example: 'usuario@ejemplo.com',
    })
    @IsEmail()
    email: string;
}
