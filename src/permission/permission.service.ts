import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from 'src/schemas/permission.schema';
import { Access } from 'src/schemas/access.schema';

@Injectable()
export class PermissionService {

  constructor(
    @InjectModel(Permission.name) private readonly permissionModel: Model<Permission>,
    @InjectModel(Access.name) private readonly accessModel: Model<Access>
  ) { }

  create(createPermissionDto: CreatePermissionDto) {
    return this.permissionModel.create(createPermissionDto);
  }

  findAll() {
    return this.permissionModel.find();
  }

  findOne(id: string) {
    return this.permissionModel.findById(id).populate('access');
  }

  update(id: string, updatePermissionDto: UpdatePermissionDto) {
    return this.permissionModel.findByIdAndUpdate(id, updatePermissionDto, {
      new: true,
    })
  }

  async remove(id: string) {
    const count = await this.accessModel.countDocuments({ permission: id });
    if (count > 0) {
      throw new BadRequestException(
        `No se puede eliminar Permission ${id} porque tiene ${count} acceso(s) asociado(s)`,
      );
    }
    const deleted = await this.permissionModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Permission ${id} no encontrado`);
    }
    return deleted;
  }
}
