import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAccessDto } from './dto/create-access.dto';
import { UpdateAccessDto } from './dto/update-access.dto';
import { Model, Connection } from 'mongoose';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Access } from 'src/schemas/access.schema';
import { Role } from 'src/schemas/role.schema';
import { Permission } from 'src/schemas/permission.schema';

@Injectable()
export class AccessService {
  constructor(
    @InjectModel(Access.name) private accessModel: Model<Access>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectConnection() private readonly connection: Connection,
  ) { }

  async create(dto: CreateAccessDto): Promise<Access> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const [access] = await this.accessModel.create([dto], { session });
      const permUpdate = await this.permissionModel.updateOne(
        { _id: dto.permission },
        { $addToSet: { access: access._id } },
        { session },
      );
      if (permUpdate.matchedCount === 0) {
        throw new NotFoundException(`Permission ${dto.permission} not found`);
      }
      const roleUpdate = await this.roleModel.updateOne(
        { _id: dto.role },
        { $addToSet: { access: access._id } },
        { session },
      );
      if (roleUpdate.matchedCount === 0) {
        throw new NotFoundException(`Role ${dto.role} not found`);
      }
      await session.commitTransaction();
      return access;
    } catch (error) {
      await session.abortTransaction();
      throw error instanceof NotFoundException ? error : new BadRequestException('Failed to create access relation');
    } finally {
      session.endSession();
    }
  }


  findAll() {
    return this.accessModel.find().populate('role').populate('permission');
  }

  findOne(id: string) {
    return this.accessModel.findById(id).populate('role').populate('permission');
  }

  async update(id: string, dto: UpdateAccessDto): Promise<Access> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const oldAccess = await this.accessModel.findById(id, {}, { session });
      if (!oldAccess) {
        throw new NotFoundException(`Access ${id} no encontrado`);
      }

      const updated = await this.accessModel.findByIdAndUpdate(id, dto, {
        new: true,
        session,
      });

      if (!updated) {
        throw new NotFoundException(`Access ${id} not found after update`);
      }

      if (dto.role && !oldAccess.role.equals(dto.role)) {
        await Promise.all([
          this.roleModel.updateOne(
            { _id: oldAccess.role },
            { $pull: { access: id } },
            { session },
          ),
          this.roleModel.updateOne(
            { _id: dto.role },
            { $addToSet: { access: id } },
            { session },
          ),
        ]);
      }

      if (dto.permission && !oldAccess.permission.equals(dto.permission)) {
        await Promise.all([
          this.permissionModel.updateOne(
            { _id: oldAccess.permission },
            { $pull: { access: id } },
            { session },
          ),
          this.permissionModel.updateOne(
            { _id: dto.permission },
            { $addToSet: { access: id } },
            { session },
          ),
        ]);
      }

      await session.commitTransaction();
      return updated;
    } catch (err) {
      await session.abortTransaction();
      throw err instanceof NotFoundException
        ? err
        : new BadRequestException('Error al actualizar acceso');
    } finally {
      session.endSession();
    }
  }

  async remove(id: string): Promise<Access> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const access = await this.accessModel.findByIdAndDelete(id, { session });
      if (!access) {
        throw new NotFoundException(`Access con id ${id} no encontrado`);
      }

      await this.roleModel.updateOne(
        { _id: access.role },
        { $pull: { access: access._id } },
        { session },
      );

      await this.permissionModel.updateOne(
        { _id: access.permission },
        { $pull: { access: access._id } },
        { session },
      );

      await session.commitTransaction();
      return access;
    } catch (error) {
      await session.abortTransaction();
      throw error instanceof NotFoundException
        ? error
        : new BadRequestException('Error al eliminar la relación de acceso');
    } finally {
      session.endSession();
    }
  }
}


