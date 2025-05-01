import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Token de restablecimiento que llegó al correo del usuario',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    token: string;

    @ApiProperty({
        description: 'Nueva contraseña que reemplazará a la anterior (mínimo 6 caracteres)',
        example: 'MiNuevaPass123!',
        minLength: 6,
    })
    @IsString()
    @MinLength(6)
    newPassword: string;
}
