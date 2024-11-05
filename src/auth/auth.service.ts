import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Logger } from 'nestjs-pino';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private readonly logger: Logger,
    ) { }

    async validateUser(email: string, pass: string): Promise<User> {
        try {
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                this.logger.warn(`Failed login attempt: User with email ${email} not found`);
                throw new UnauthorizedException('Invalid credentials');
            }

            const isPasswordMatching = await bcrypt.compare(pass, user.password);
            if (!isPasswordMatching) {
                this.logger.warn(`Failed login attempt: Incorrect password for email ${email}`);
                throw new UnauthorizedException('Invalid credentials');
            }

            this.logger.log(`User ${email} successfully validated`);
            return user;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error; // UnauthorizedException is rethrown for the client
            }
            this.logger.error(`Error during user validation for email ${email}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An unexpected error occurred during validation');
        }
    }

    async login(user: User) {
        try {
            const payload = { userId: user.id, sub: user.id, role: user.role };
            const token = this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_SECRET'),
                algorithm: this.configService.get('JWT_ALGORITHM') || 'HS256',
                expiresIn: `${this.configService.get('JWT_MIN_VALIDITY_HOURS') || 1}h`,
            });

            this.logger.log(`User ${user.email} logged in successfully`);
            return { token };
        } catch (error) {
            this.logger.error(`Error generating token for user ${user.email}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An unexpected error occurred during login');
        }
    }
}
