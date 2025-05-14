import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { Permission } from '../schemas/permission.schema';
import { Access } from '../schemas/access.schema';
import { User } from '../schemas/user.schema';

@Injectable()
export class AccessGuard implements CanActivate {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Permission.name) private permModel: Model<Permission>,
        @InjectModel(Access.name) private accessModel: Model<Access>,
    ) { }

    private normalizePath(path: string): string {
        return path
            .split('/')
            .map(seg => {
                if (
                    /^[0-9a-fA-F]{24}$/.test(seg) ||
                    (/^\d+$/.test(seg) && !/^v\d+$/.test(seg)) ||
                    /@/.test(seg)
                ) {
                    return '?';
                }
                return seg;
            })
            .join('/');
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const jwtUser = req.user as { userId: string };


        if (!jwtUser?.userId) throw new ForbiddenException('No autenticado');
        const user = await this.userModel.findById(jwtUser.userId).exec();
        if (!user || !user.role) throw new ForbiddenException('Usuario sin rol definido');


        const normalizedPath = this.normalizePath(req.path);
        console.log('Ruta normalizada:', normalizedPath);


        const method = req.method;
        const parts = normalizedPath.split('/').filter(Boolean);
        const module = parts.includes('api')
            ? parts[parts.indexOf('api') + 2]
            : parts[0];

        console.log('Metodo:', method);

        const permission = await this.permModel
            .findOne({ url: normalizedPath, method, module })
            .exec();

        console.log('Permiso:', permission);

        if (!permission) throw new ForbiddenException('Permiso no encontrado');

        console.log('Usuario:', user);
        console.log('Rol del usuario:', user.role);
        console.log('permiso:', permission._id);
        console.log('Método:', method);
        {
            const hasAccess = await this.accessModel
                .findOne({ role: user.role, permission: permission._id })
                .exec();
            console.log('Acceso:', hasAccess);
            console.log('Acceso Permiso:', hasAccess?.permission, 'Acceso Rol:', hasAccess?.role);
            if (!hasAccess) throw new ForbiddenException('Acceso denegado');

            return true;
        }
    }
}