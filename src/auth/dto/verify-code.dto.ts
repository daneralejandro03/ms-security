import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyCodeDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario que recibe el código de verificación',
        example: 'usuario@ejemplo.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'Código de verificación de 6 dígitos enviado al correo',
        example: '123456',
        minLength: 6,
        maxLength: 6,
    })
    @IsString()
    @Length(6, 6)
    code: string;
}
