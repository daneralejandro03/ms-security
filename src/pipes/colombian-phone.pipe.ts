// src/pipes/colombian-phone.pipe.ts

import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ColombianPhonePipe implements PipeTransform {
    transform(value: any): number {
        if (typeof value !== 'number' || !Number.isInteger(value)) {
            throw new BadRequestException('El teléfono debe ser un número entero');
        }

        let digits = value.toString().replace(/\D/g, '');

        if (!digits.startsWith('57')) {
            digits = `57${digits}`;
        }

        if (digits.length < 9 || digits.length > 16) {
            throw new BadRequestException(
                'El número debe tener entre 9 y 16 dígitos (incluyendo el prefijo 57).',
            );
        }

        const normalized = Number(digits);
        if (Number.isNaN(normalized)) {
            throw new BadRequestException(
                'Error al convertir el teléfono normalizado a número',
            );
        }

        return normalized;
    }
}
