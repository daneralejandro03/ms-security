import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { CreateSmDto } from './dto/create-sm.dto';
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Sms } from './entities/sms.entity';



@Injectable()
export class SmsService {

  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly http: HttpService) { }

  async sendSms(payload: CreateSmDto): Promise<Sms> {
    try {
      const response: AxiosResponse<{ data: Sms }> = await firstValueFrom(
        this.http.post('/sms/send', payload),
      );
      const { sid, status } = response.data.data;
      this.logger.log(`SMS enviado → SID=${sid}, estado=${status}`);
      return { sid, status, to: payload.to, body: payload.body };
    } catch (err: unknown) {
      const axiosErr = err as AxiosError;
      this.logger.error(
        'Error enviando SMS',
        axiosErr.response?.data ?? axiosErr.message,
      );
      throw err;
    }
  }
}
