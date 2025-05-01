import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateAccessDto {
    @ApiProperty({
        description: 'ID del rol al que se asignará el permiso',
        example: '680ee3e85c022987822c83da',
    })
    @IsString()
    @IsNotEmpty()
    readonly role: string;

    @ApiProperty({
        description: 'ID del permiso que se asignará al rol',
        example: '5f8d0d55b54764421b7156c5',
    })
    @IsString()
    @IsNotEmpty()
    readonly permission: string;
}
