import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
    Request,
    InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserRole } from './models/enums/user-role.enum';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles/roles.decorator';
import { RolesGuard } from '../common/guards/roles/roles.guard';
import { Logger } from 'nestjs-pino';

@Controller({
    path: 'users',
    version: '1',
})
export class UsersController {

    constructor(private readonly usersService: UsersService, private readonly logger: Logger) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        try {
            const user = await this.usersService.create(createUserDto);
            this.logger.log(`User created successfully with ID: ${user.id}`);
            return user;
        } catch (error) {
            this.logger.error('Failed to create user', error.stack);
            throw new InternalServerErrorException('An error occurred while creating the user');
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Get()
    async findAll() {
        try {
            const users = await this.usersService.findAll();
            this.logger.log(`Fetched all users, count: ${users.length}`);
            return users;
        } catch (error) {
            this.logger.error('Failed to fetch users', error.stack);
            throw new InternalServerErrorException('An error occurred while fetching users');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Request() req) {
        try {
            const user = await this.usersService.findOne(+id);
            if (req.user.role !== UserRole.ADMIN && req.user.id !== user.id) {
                this.logger.warn(`Access denied for user ID: ${req.user.id} on user ID: ${id}`);
                throw new ForbiddenException('Access denied');
            }
            this.logger.log(`Fetched user with ID: ${id}`);
            return user;
        } catch (error) {
            this.logger.error(`Failed to fetch user with ID: ${id}`, error.stack);
            throw error instanceof ForbiddenException ? error : new InternalServerErrorException('An error occurred while fetching the user');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @Request() req,
    ) {
        try {
            const user = await this.usersService.findOne(+id);
            if (req.user.role !== UserRole.ADMIN && req.user.id !== user.id) {
                this.logger.warn(`Access denied for user ID: ${req.user.id} on user ID: ${id}`);
                throw new ForbiddenException('Access denied');
            }
            const updatedUser = await this.usersService.update(+id, updateUserDto);
            this.logger.log(`User updated successfully with ID: ${id}`);
            return updatedUser;
        } catch (error) {
            this.logger.error(`Failed to update user with ID: ${id}`, error.stack);
            throw error instanceof ForbiddenException ? error : new InternalServerErrorException('An error occurred while updating the user');
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            await this.usersService.remove(+id);
            this.logger.log(`User deleted successfully with ID: ${id}`);
            return { message: 'User deleted successfully' };
        } catch (error) {
            this.logger.error(`Failed to delete user with ID: ${id}`, error.stack);
            throw new InternalServerErrorException('An error occurred while deleting the user');
        }
    }
}
