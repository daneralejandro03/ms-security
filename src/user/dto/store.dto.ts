import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StoreDto {
    @ApiProperty({ description: 'ID de la tienda a asociar', example: 123 })
    @IsInt()
    @Min(1)
    storeId: number;
}
