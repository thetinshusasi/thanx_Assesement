import { Body, Controller, Post, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UserRole } from '../users/models/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { Logger } from 'nestjs-pino';

@ApiTags('Authentication')
@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private readonly logger: Logger,
    ) { }

    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post('signup')
    async signup(@Body() createUserDto: CreateUserDto) {
        try {
            createUserDto.role = UserRole.CUSTOMER; // Assign customer role by default
            await this.usersService.create(createUserDto);
            this.logger.log(`User registered successfully with email: ${createUserDto.email}`);
            return { message: 'User registered successfully' };
        } catch (error) {
            this.logger.error(`Error during signup for email ${createUserDto.email}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred during registration');
        }
    }

    @ApiOperation({ summary: 'User login' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'user@example.com' },
                password: { type: 'string', example: 'password123' },
            },
        },
    })
    @ApiResponse({ status: 200, description: 'User login successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @Post('login')
    async login(@Body() credentials: { email: string; password: string }) {
        try {
            const user = await this.authService.validateUser(
                credentials.email,
                credentials.password,
            );
            this.logger.log(`User login successful for email: ${credentials.email}`);
            return this.authService.login(user);
        } catch (error) {
            if (error.name === 'UnauthorizedException') {
                this.logger.warn(`Unauthorized login attempt for email: ${credentials.email}`);
                throw error; // Rethrow to return 401 Unauthorized to client
            }
            this.logger.error(`Error during login for email ${credentials.email}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred during login');
        }
    }
}
