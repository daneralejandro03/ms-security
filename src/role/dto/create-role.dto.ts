import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
    @ApiProperty({
        description: 'Nombre del rol',
        example: 'Administrator',
    })
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
