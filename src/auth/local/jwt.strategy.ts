import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from 'passport-jwt';

// Amplía el payload para incluir el rol
interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(JwtStrategy) {
    constructor(private configService: ConfigService) {
        const jwtSecret = configService.get<string>('JWT_SECRET');

        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }

        const options: StrategyOptions = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        };

        super(options);
    }

    // Ahora validate devuelve también el role sin nuevas consultas a BD
    validate(payload: JwtPayload): Promise<{ userId: string; email: string; role: string }> {
        return Promise.resolve({
            userId: payload.id,
            email: payload.email,
            role: payload.role,
        });
    }
}
