import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { Role, RoleSchema } from '../schemas/role.schema';
import { PassportModule } from '@nestjs/passport';
import { EmailModule } from '../email/email.module';
import { SmsModule } from 'src/sms/sms.module';
import { LocalStrategy } from './local/local.strategy';
import { JwtAuthStrategy } from './local/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '2h' },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Role.name, schema: RoleSchema }]),
    EmailModule, SmsModule,
  ],
  providers: [AuthService, LocalStrategy, JwtAuthStrategy],
  controllers: [AuthController]
})
export class AuthModule { }
