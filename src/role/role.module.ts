import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { Role, RoleSchema } from 'src/schemas/role.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Access, AccessSchema } from 'src/schemas/access.schema';
import { AccessGuard } from '../guards/access.guard';
import { PermissionModule } from '../permission/permission.module';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
      { name: Access.name, schema: AccessSchema },
    ]),
    PermissionModule,
  ],
  controllers: [RoleController],
  providers: [RoleService, AccessGuard],
  exports: [RoleService],
})
export class RoleModule { }
