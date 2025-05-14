import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../schemas/user.schema';
import { Role } from '../schemas/role.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectConnection() private readonly connection: Connection,
    private emailService: EmailService,
  ) { }


  async create(
    createUserDto: CreateUserDto,
    roleId: string,
    currentUser: User
  ) {
    // 1) Verificar rol del usuario actual
    const currentRole = await this.roleModel.findById(currentUser.role).exec();
    if (!currentRole) {
      throw new ForbiddenException('Rol del usuario actual no válido');
    }

    // 2) Verificar rol destino usando el roleId de la URL
    const targetRole = await this.roleModel.findById(roleId).exec();
    if (!targetRole) {
      throw new NotFoundException('Rol destino no encontrado');
    }

    // 3) Lógica de permisos
    if (
      currentRole.name !== 'Administrator' &&
      targetRole.name === 'Administrator'
    ) {
      throw new ForbiddenException(
        `Como ${currentRole.name} no puedes crear usuarios con rol Administrator`,
      );
    }
    if (!['Administrator', 'Manager'].includes(currentRole.name)) {
      throw new ForbiddenException('No tienes permisos para crear usuarios');
    }

    // 4) Validar email único
    const exists = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (exists) {
      throw new BadRequestException('Email ya registrado');
    }

    // 5) Hashear la contraseña y generar códigos
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    // 6) Transacción MongoDB
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const [createdUser] = await this.userModel.create(
        [{
          ...createUserDto,
          password: hashedPassword,
          role: targetRole._id,
          estado: false,
          verificationCode,
          verificationCodeExpires: verificationExpires,
          requiresTwoFactor: false,
        }],
        { session },
      );

      // 7) Asociar usuario al rol
      await this.roleModel.updateOne(
        { _id: targetRole._id },
        { $push: { users: createdUser._id } },
        { session },
      ).exec();

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw new BadRequestException('Error creando usuario' + error);
    } finally {
      session.endSession();
    }

    // 8) Enviar email de verificación
    await this.emailService.sendMail({
      address: createUserDto.email,
      subject: 'Código de verificación',
      plainText: `Tu código es: ${verificationCode}. Expira en 15 minutos.`,
    });

    const userReturn = await this.findOneEmail(createUserDto.email);
    if (!userReturn) {
      throw new NotFoundException('Usuario creado no encontrado');
    }

    return {
      message: 'Usuario creado, revisa tu email para verificar la cuenta',
      user: userReturn,
    };
  }

  async findAll() {
    return this.userModel.find();
  }

  async findOneEmail(email: string) {
    const user = await this.userModel.findOne({ email }).populate('role');
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return {
      id: user._id,
      email: user.email,
      role: user.role._id,
    }
  }

  async findOne(id: string) {
    return this.userModel.findById(id).populate('role');
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: User
  ) {
    const currentRole = await this.roleModel.findById(currentUser.role).exec();
    if (!currentRole) {
      throw new ForbiddenException('Rol del usuario actual no válido');
    }

    const targetUser = await this.userModel.findById(id).populate('role').exec();
    if (!targetUser) {
      throw new NotFoundException('Usuario a actualizar no encontrado');
    }
    const targetRole = await this.roleModel.findById(targetUser.role).exec();

    if (currentRole.name === 'Administrator') {
      // OK: Admin puede hacer todo
    } else if (currentRole.name === 'Manager') {

      if (!targetRole) {
        throw new NotFoundException('Rol del usuario objetivo no encontrado');
      }

      if (targetRole.name === 'Administrator') {
        throw new ForbiddenException(
          `Como ${currentRole.name} no puedes actualizar usuarios con rol Administrator`,
        );
      }
    } else {
      throw new ForbiddenException('No tienes permisos para actualizar usuarios');
    }

    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true });
  }

  async remove(
    id: string,
    currentUser: User
  ) {
    const currentRole = await this.roleModel.findById(currentUser.role).exec();
    if (!currentRole) {
      throw new ForbiddenException('Rol del usuario actual no válido');
    }

    const targetUser = await this.userModel.findById(id).populate('role').exec();
    if (!targetUser) {
      throw new NotFoundException('Usuario a eliminar no encontrado');
    }
    const targetRole = await this.roleModel.findById(targetUser.role).exec();

    if (currentRole.name === 'Administrator') {
      // OK: Admin puede eliminar todo
    } else if (currentRole.name === 'Manager') {
      if (!targetRole) {
        throw new NotFoundException('Rol del usuario objetivo no encontrado');
      }
      if (targetRole.name === 'Administrator') {
        throw new ForbiddenException(
          `Como ${currentRole.name} no puedes eliminar usuarios con rol Administrator`,
        );
      }
    } else {
      throw new ForbiddenException('No tienes permisos para eliminar usuarios');
    }

    return this.userModel.findByIdAndDelete(id);
  }

  async addStoreToUser(userId: string, storeId: number): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { stores: storeId } },
    ).exec();
    return result.acknowledged && result.matchedCount > 0;
  }

  async removeStoreFromUser(userId: string, storeId: number): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $pull: { stores: storeId } },   // remueve todas las ocurrencias
    ).exec();
    return result.acknowledged && result.matchedCount > 0;
  }
}
