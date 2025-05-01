import { Module } from '@nestjs/common';
import { AccessService } from './access.service';
import { AccessController } from './access.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from '../schemas/permission.schema';
import { Role, RoleSchema } from '../schemas/role.schema';
import { Access, AccessSchema } from '../schemas/access.schema';
import { PermissionModule } from '../permission/permission.module';
import { AccessGuard } from '../guards/access.guard';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Access.name, schema: AccessSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },

    ]),
    PermissionModule,
  ],
  controllers: [AccessController],
  providers: [AccessService, AccessGuard],
})
export class AccessModule { }
