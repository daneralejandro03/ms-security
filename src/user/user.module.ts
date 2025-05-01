import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { EmailModule } from 'src/email/email.module';
import { Role, RoleSchema } from 'src/schemas/role.schema';
import { AccessGuard } from '../guards/access.guard';
import { PermissionModule } from 'src/permission/permission.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
    ]), EmailModule, PermissionModule,
  ],

  controllers: [UserController],
  providers: [UserService, AccessGuard],
  exports: [UserService],
})
export class UserModule { }
