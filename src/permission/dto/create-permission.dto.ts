import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto {
    @ApiProperty({
        description: 'URL del endpoint al que aplica el permiso',
        example: '/api/v1/users',
    })
    @IsString()
    @IsNotEmpty()
    readonly url: string;

    @ApiProperty({
        description: 'Método HTTP permitido para la URL',
        example: 'GET',
    })
    @IsString()
    @IsNotEmpty()
    readonly method: string;

    @ApiProperty({
        description: 'Módulo o recurso al que pertenece este permiso',
        example: 'users',
    })
    @IsString()
    @IsNotEmpty()
    readonly module: string;

    @ApiProperty({
        description: 'Descripción legible del permiso',
        example: 'Permite obtener la lista de usuarios',
    })
    @IsString()
    @IsNotEmpty()
    readonly description: string;
}
