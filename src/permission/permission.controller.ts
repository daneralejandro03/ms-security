import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AccessGuard } from '../guards/access.guard';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Permission')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AccessGuard)
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo permiso' })
  @ApiBody({ type: CreatePermissionDto, description: 'Datos para crear permiso' })
  @ApiResponse({ status: 201, description: 'Permiso creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los permisos' })
  @ApiResponse({ status: 200, description: 'Listado de permisos retornado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll() {
    return this.permissionService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un permiso por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID del permiso' })
  @ApiResponse({ status: 200, description: 'Permiso encontrado.' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findOne(@Param('id') id: string) {
    return this.permissionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un permiso existente' })
  @ApiParam({ name: 'id', type: String, description: 'ID del permiso a actualizar' })
  @ApiBody({ type: UpdatePermissionDto, description: 'Campos a modificar' })
  @ApiResponse({ status: 200, description: 'Permiso actualizado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos de actualización inválidos.' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un permiso por su ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID del permiso a eliminar' })
  @ApiResponse({ status: 200, description: 'Permiso eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Permiso no encontrado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  remove(@Param('id') id: string) {
    return this.permissionService.remove(id);
  }
}
