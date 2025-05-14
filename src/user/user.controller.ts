import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  NotFoundException
} from '@nestjs/common';
import { UserService } from './user.service';
import { EmailService } from 'src/email/email.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { StoreDto } from './dto/store.dto';
import { AccessGuard } from '../guards/access.guard';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../schemas/user.schema';
import { ColombianPhonePipe } from '../pipes/colombian-phone.pipe';


import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AccessGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) { }

  @Post(':roleId')
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiParam({ name: 'roleId', type: String, description: 'ID del rol a asignar' })
  @ApiBody({ type: CreateUserDto, description: 'Datos para nuevo usuario' })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o usuario ya existe.' })
  async create(
    @Param('roleId') roleId: string,
    @Body() createUserDto: CreateUserDto,
    @Body('cellPhone', ColombianPhonePipe) cellPhone: number,
    @Req() req: AuthenticatedRequest,
  ) {
    const currentUser = req.user;
    console.log('Usuario actual:', currentUser);
    createUserDto.cellPhone = cellPhone;;
    return this.userService.create(createUserDto, roleId, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Listado de usuarios retornado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll() {
    console.log('Obteniendo todos los usuarios');
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por su ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Obtener un usuario por su Email' })
  @ApiParam({ name: 'email', type: String, description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findOneEmail(@Param('email') email: string) {
    return this.userService.findOneEmail(email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un usuario existente' })
  @ApiParam({ name: 'id', type: String, description: 'ID del usuario a actualizar' })
  @ApiBody({ type: UpdateUserDto, description: 'Campos a modificar' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos de actualización inválidos.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.userService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario por su ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID del usuario a eliminar' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async remove(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.userService.remove(id, req.user);
  }

  @Patch(':id/store')
  @ApiOperation({ summary: 'Asocia una tienda a un usuario' })
  @ApiParam({ name: 'id', type: String, description: 'ID del usuario' })
  @ApiBody({ type: StoreDto })
  @ApiResponse({
    status: 200,
    description: 'Tienda asociada correctamente al usuario',
    schema: {
      properties: {
        message: { type: 'string', example: 'Store añadido al usuario' },
        storeId: { type: 'number', example: 123 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async addStore(
    @Param('id') id: string,
    @Body() dto: StoreDto,
  ) {
    const updated = await this.userService.addStoreToUser(id, dto.storeId);
    if (!updated) throw new NotFoundException(`User #${id} not found`);
    return { message: 'Store añadido al usuario', storeId: dto.storeId };
  }

  @Patch(':id/store/remove')
  @ApiOperation({ summary: 'Desasocia una tienda de un usuario' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID del usuario del que se removerá la tienda',
  })
  @ApiBody({
    type: StoreDto,
    description: 'DTO que contiene el storeId a desasociar',
  })
  @ApiResponse({
    status: 200,
    description: 'Tienda removida correctamente del usuario',
    schema: {
      properties: {
        message: { type: 'string', example: 'Store removido del usuario' },
        storeId: { type: 'number', example: 123 },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario o tienda no encontrados' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async removeStore(
    @Param('id') id: string,
    @Body() dto: StoreDto,
  ) {
    const updated = await this.userService.removeStoreFromUser(id, dto.storeId);
    if (!updated) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return { message: 'Store removido del usuario', storeId: dto.storeId };
  }
}
