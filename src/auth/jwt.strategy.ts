import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private configService: ConfigService,
        private readonly logger: Logger,
    ) {
        const options: StrategyOptions = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        };
        super(options);
    }

    async validate(payload: any) {
        try {
            if (!payload || !payload.sub || !payload.role) {
                this.logger.warn('Invalid JWT payload structure');
                throw new UnauthorizedException('Invalid token');
            }

            this.logger.log(`JWT validation successful for user ID: ${payload.sub}`);
            return { id: payload.sub, role: payload.role };
        } catch (error) {
            this.logger.error(`Error during JWT validation: ${error.message}`, error.stack);
            throw new UnauthorizedException('Token validation failed');
        }
    }
}
