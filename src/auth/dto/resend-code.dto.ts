import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendCodeDto {
  @ApiProperty({
    description: 'Correo electrónico donde se reenviará el código de verificación',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail()
  email: string;
}
