import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from 'src/schemas/role.schema';
import { Access } from 'src/schemas/access.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @InjectModel(Access.name) private readonly accessModel: Model<Access>
  ) { }

  async create(createRoleDto: CreateRoleDto) {

    const exists = await this.roleModel.findOne({ name: createRoleDto.name }).exec();
    if (exists) {
      throw new BadRequestException(`El rol '${createRoleDto.name}' ya existe`);
    }

    return this.roleModel.create(createRoleDto);
  }

  findAll() {
    return this.roleModel.find();
  }

  findOne(id: string) {
    return this.roleModel.findById(id);
  }

  update(id: string, updateRoleDto: UpdateRoleDto) {
    return this.roleModel.findByIdAndUpdate(id, updateRoleDto, {
      new: true,
    });
  }

  async remove(id: string) {
    const count = await this.accessModel.countDocuments({ role: id });
    if (count > 0) {
      throw new BadRequestException(
        `No se puede eliminar Role ${id} porque tiene ${count} acceso(s) asociado(s)`,
      );
    }
    const deleted = await this.roleModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new NotFoundException(`Role ${id} no encontrado`);
    }
    return deleted;
  }
}
