import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { Role } from '../../enums/role.enum';

export class CreateRoleDto {
    @ApiProperty({
        description: 'Nombre del rol',
        enum: Role,
        example: Role.Administrator,
    })
    @IsEnum(Role, { message: `El rol debe ser uno de: ${Object.values(Role).join(', ')}` })
    @IsString()
    @IsNotEmpty()
    readonly name: string;
}
