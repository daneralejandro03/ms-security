// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { CreateEmailDto } from './dto/create-email.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly http: HttpService) { }

  async sendMail(payload: CreateEmailDto): Promise<void> {
    try {
      const response$ = this.http.post('/email/send', payload);
      const response = await firstValueFrom(response$);
      this.logger.log(`Correo enviado: ${response.status} ${response.statusText}`);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      this.logger.error(
        'Error enviando correo',
        axiosError.response?.data ?? axiosError.message,
      );
      throw error;
    }
  }
}
