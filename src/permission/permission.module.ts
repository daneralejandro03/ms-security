import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Permission, PermissionSchema } from '../schemas/permission.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Access, AccessSchema } from '../schemas/access.schema';
import { AccessGuard } from '../guards/access.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Access.name, schema: AccessSchema },
    ])
  ],
  controllers: [PermissionController],
  providers: [PermissionService, AccessGuard],
  exports: [MongooseModule],
})
export class PermissionModule { }
