import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../email/email.service';
import { SmsService } from 'src/sms/sms.service';
import { ToggleTwoFactorDto } from './dto/toggle-two-factor.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { TwoFactorDto } from './dto/two-factor.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from 'src/schemas/user.schema';
import { Role } from 'src/schemas/role.schema';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectConnection() private readonly connection: Connection,

    private jwtService: JwtService,
    private emailService: EmailService,
    private smsService: SmsService,
  ) { }

  async register(dto: RegisterUserDto) {

    const exists = await this.userModel.findOne({ email: dto.email });
    if (exists) throw new BadRequestException('Email ya registrado');

    const guestRole = await this.roleModel.findOne({ name: 'Guest' }).exec();
    if (!guestRole) throw new NotFoundException('Rol Guest no encontrado');

    const hash = await bcrypt.hash(dto.password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    const session = await this.connection.startSession();
    session.startTransaction();
    try {

      const [createdUser] = await this.userModel.create([{
        ...dto,
        password: hash,
        role: guestRole._id,
        estado: false,
        verificationCode: code,
        verificationCodeExpires: expires,
        requiresTwoFactor: false,
      }], { session });

      await this.roleModel.updateOne(
        { _id: guestRole._id },
        { $push: { users: createdUser._id } },
        { session }
      ).exec();

      await session.commitTransaction();
    } catch (err) {
      await session.abortTransaction();
      console.error('Error al registrar usuario:', err);
      throw new BadRequestException('Error al registrar usuario');
    } finally {
      session.endSession();
    }

    // 5) Envío código de verificación por email
    await this.emailService.sendMail({
      address: dto.email,
      subject: 'Código de verificación',
      plainText: `Tu código es: ${code}. Expira en 15 minutos.`,
    });

    return { message: 'Usuario registrado, revisa tu email' };
  }


  async verify({ email, code }: VerifyCodeDto) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Usuario no existe');
    if (user.estado === true) throw new BadRequestException('Usuario ya verificado');
    if (user.verificationCode !== code || user.verificationCodeExpires < new Date()) {
      throw new BadRequestException('Código inválido o expirado');
    }
    user.estado = true;
    user.verificationCode = "";
    user.verificationCodeExpires = new Date(0);
    await user.save();
    const token = this.jwtService.sign({
      id: user._id.toString(),
      email: user.email,
      role: user.role.toString(),
    });;
    return { message: 'Cuenta verificada', token };
  }


  async resend({ email }: ResendCodeDto) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Usuario no existe');
    if (user.estado === true) throw new BadRequestException('Ya verificado');
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    await this.emailService.sendMail({
      address: email,
      subject: 'Nuevo código de verificación',
      plainText: `Tu nuevo código es: ${code}.`,
    });
    return { message: 'Código reenviado' };
  }


  async toggleTwoFactor(dto: ToggleTwoFactorDto) {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new NotFoundException('Usuario no existe');

    user.requiresTwoFactor = dto.enable;
    await user.save();

    return { message: `2FA ${dto.enable ? 'habilitado' : 'deshabilitado'} correctamente` };
  }

  async login(dto: LoginDto) {
    const { email, password, twoFactorMethod = 'email' } = dto;
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new BadRequestException('Credenciales inválidas');
    }
    if (!user.estado) {
      throw new BadRequestException('Cuenta no verificada');
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Credenciales inválidas');
    }


    if (!user.requiresTwoFactor) {
      const payload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role.toString(),
      };
      return { access_token: this.jwtService.sign(payload) };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    user.twoFactorCode = code;
    user.twoFactorCodeExpires = expires;
    await user.save();

    const text = `Tu código 2FA es: ${code}. Expira en 10 minutos.`;

    if (twoFactorMethod === 'sms') {
      if (!user.cellPhone) {
        throw new BadRequestException('No hay número de celular registrado');
      }

      const cellPhone = `+${user.cellPhone.toString()}`;

      await this.smsService.sendSms({ to: cellPhone, body: text });
    } else {
      await this.emailService.sendMail({
        address: email,
        subject: 'Código 2FA',
        plainText: text,
      });
    }

    return {
      message: 'Código 2FA enviado',
      method: twoFactorMethod,
      expiresAt: expires.toISOString(),
    };
  }


  async twoFactor({ email, code }: TwoFactorDto) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Usuario no existe');
    if (user.twoFactorCode !== code || user.twoFactorCodeExpires < new Date()) {
      throw new BadRequestException('Código 2FA inválido o expirado');
    }
    user.twoFactorCode = "";
    user.twoFactorCodeExpires = new Date(0);
    await user.save();
    const token = this.jwtService.sign({
      id: user._id.toString(),
      email,
      role: user.role.toString(),
    });
    return { access_token: token };
  }


  async validateUser(email: string, password: string): Promise<User | null> {

    const userWithPassword = await this.userModel.findOne({ email });

    if (!userWithPassword) {
      return null;
    }
    const isPasswordValid = await bcrypt.compare(password, userWithPassword.password);

    if (!isPasswordValid) {
      return null;
    }

    if (!userWithPassword.estado) {
      return null;
    }

    const user = await this.userModel.findOne(
      { email },
      { password: 0 }
    );

    if (user && user.requiresTwoFactor) {
      return { ...userWithPassword.toObject(), requiresTwoFactor: true };
    }
    return user;
  }

  async changePassword(dto: ChangePasswordDto) {

    const user = await this.userModel.findOne({ email: dto.email });
    console.log(user);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const match = await bcrypt.compare(dto.oldPassword, user.password);
    if (!match) throw new BadRequestException('Contraseña anterior incorrecta');

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await user.save();

    return { message: 'Contraseña actualizada correctamente' };
  }


  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException('Email no registrado');

    const token = this.jwtService.sign(
      { id: user._id },
      { expiresIn: '1h' },
    );

    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await user.save();

    const resetUrl = `https://tu-frontend.com/reset-password?token=${token}`;
    await this.emailService.sendMail({
      address: email,
      subject: 'Restablecer contraseña',
      plainText: `Para recuperar tu contraseña haz clic aquí: ${resetUrl}`,
    });

    return { message: 'Correo de recuperación enviado' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) throw new BadRequestException('Token inválido o expirado');

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return { message: 'Contraseña restablecida correctamente' };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {

    const ALLOWED_FIELDS: (keyof UpdateProfileDto)[] = [
      'name',
      'lastName',
      'gender',
      'cellPhone',
      'landline',
      'IDType',
      'IDNumber',
    ];

    const updateData: Record<string, string | number> = {};
    for (const field of ALLOWED_FIELDS) {
      if (dto[field] !== undefined) {
        if (dto[field] !== undefined) {
          updateData[field] = dto[field];
        }
      }
    }

    const updated = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true },
      )
      .select('-password -role -email');

    if (!updated) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return {
      message: 'Perfil actualizado correctamente',
      user: updated,
    };
  }
}
