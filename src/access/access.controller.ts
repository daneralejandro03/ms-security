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
import { AccessService } from './access.service';
import { UpdateAccessDto } from './dto/update-access.dto';
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

@ApiTags('Access')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), AccessGuard)
@Controller('access')
export class AccessController {
  constructor(private readonly accessService: AccessService) { }

  @Post('permission/:permissionId/role/:roleId')
  @ApiOperation({ summary: 'Asignar un permiso a un rol' })
  @ApiParam({
    name: 'permissionId',
    type: String,
    description: 'ID del permiso a asignar',
  })
  @ApiParam({
    name: 'roleId',
    type: String,
    description: 'ID del rol al que se asigna el permiso',
  })
  @ApiResponse({ status: 201, description: 'Asignación creada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  create(
    @Param('permissionId') permissionId: string,
    @Param('roleId') roleId: string,
  ) {
    const accessDto = { permission: permissionId, role: roleId };
    return this.accessService.create(accessDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las asignaciones' })
  @ApiResponse({ status: 200, description: 'Listado de asignaciones retornado.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findAll() {
    return this.accessService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación por ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la asignación' })
  @ApiResponse({ status: 200, description: 'Asignación encontrada.' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  findOne(@Param('id') id: string) {
    return this.accessService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una asignación existente' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la asignación a actualizar' })
  @ApiBody({ type: UpdateAccessDto, description: 'Datos a modificar de la asignación' })
  @ApiResponse({ status: 200, description: 'Asignación actualizada correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos de actualización inválidos.' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  update(
    @Param('id') id: string,
    @Body() updateAccessDto: UpdateAccessDto,
  ) {
    return this.accessService.update(id, updateAccessDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una asignación por su ID' })
  @ApiParam({ name: 'id', type: String, description: 'ID de la asignación a eliminar' })
  @ApiResponse({ status: 200, description: 'Asignación eliminada correctamente.' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  remove(@Param('id') id: string) {
    return this.accessService.remove(id);
  }
}
