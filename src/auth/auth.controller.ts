import { Controller, Post, Body, UseGuards, Request, Patch, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { ResendCodeDto } from './dto/resend-code.dto';
import { TwoFactorDto } from './dto/two-factor.dto';
import { ToggleTwoFactorDto } from './dto/toggle-two-factor.dto';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ColombianPhonePipe } from '../pipes/colombian-phone.pipe';
import { Request as ExpressRequest } from 'express';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
}

interface AuthenticatedRequest extends ExpressRequest {
  user: AuthenticatedUser;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  @ApiOperation({ summary: 'Registrar nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  register(
    @Body('cellPhone', ColombianPhonePipe) cellPhone: number,
    @Body() dto: RegisterUserDto
  ) {
    dto.cellPhone = cellPhone;
    return this.authService.register(dto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verificar código de registro' })
  @ApiResponse({ status: 200, description: 'Código verificado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado.' })
  verify(@Body() dto: VerifyCodeDto) {
    return this.authService.verify(dto);
  }

  @Post('resend')
  @ApiOperation({ summary: 'Reenviar código de verificación' })
  @ApiResponse({ status: 200, description: 'Código reenviado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error al reenviar el código.' })
  resend(@Body() dto: ResendCodeDto) {
    return this.authService.resend(dto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  login(@Request() req, @Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('2fa')
  @ApiOperation({ summary: 'Verificar código de autenticación de dos factores' })
  @ApiResponse({ status: 200, description: 'Código 2FA verificado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Código 2FA inválido o expirado.' })
  twoFactor(@Body() dto: TwoFactorDto) {
    return this.authService.twoFactor(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('2fa/toggle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar/Desactivar autenticación de dos factores' })
  @ApiResponse({ status: 200, description: 'Estado de 2FA actualizado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  toggleTwoFactor(@Body() dto: ToggleTwoFactorDto) {
    return this.authService.toggleTwoFactor(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  changePassword(@Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar datos personales del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(req.user.id, dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  @ApiResponse({ status: 200, description: 'Correo de restablecimiento enviado.' })
  @ApiResponse({ status: 400, description: 'Correo electrónico no registrado.' })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña' })
  @ApiResponse({ status: 200, description: 'Contraseña restablecida exitosamente.' })
  @ApiResponse({ status: 400, description: 'Token inválido o expirado.' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
