import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User) private usersRepository: Repository<User>,
        private readonly logger: Logger
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        try {
            const user = this.usersRepository.create(createUserDto);
            const savedUser = await this.usersRepository.save(user);
            this.logger.log(`User created successfully with ID: ${savedUser.id}`);
            return savedUser;
        } catch (error) {
            this.logger.error('Failed to create user', error.stack);
            throw new InternalServerErrorException('An error occurred while creating the user');
        }
    }

    async findAll(): Promise<User[]> {
        try {
            const users = await this.usersRepository.find();
            this.logger.log(`Fetched all users, count: ${users.length}`);
            return users;
        } catch (error) {
            this.logger.error('Failed to fetch users', error.stack);
            throw new InternalServerErrorException('An error occurred while fetching users');
        }
    }

    async findOne(id: number): Promise<User> {
        try {
            const user = await this.usersRepository.findOneBy({ id });
            if (!user) {
                this.logger.warn(`User not found with ID: ${id}`);
                throw new NotFoundException('User not found');
            }
            this.logger.log(`Fetched user with ID: ${id}`);
            return user;
        } catch (error) {
            this.logger.error(`Failed to fetch user with ID: ${id}`, error.stack);
            throw error instanceof NotFoundException ? error : new InternalServerErrorException('An error occurred while fetching the user');
        }
    }

    async findByEmail(email: string): Promise<User> {
        try {
            const user = await this.usersRepository.findOneBy({ email });
            if (!user) {
                this.logger.warn(`User not found with email: ${email}`);
            } else {
                this.logger.log(`Fetched user with email: ${email}`);
            }
            return user;
        } catch (error) {
            this.logger.error(`Failed to fetch user with email: ${email}`, error.stack);
            throw new InternalServerErrorException('An error occurred while fetching the user by email');
        }
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        try {
            await this.usersRepository.update(id, updateUserDto);
            const updatedUser = await this.findOne(id);
            this.logger.log(`User updated successfully with ID: ${id}`);
            return updatedUser;
        } catch (error) {
            this.logger.error(`Failed to update user with ID: ${id}`, error.stack);
            throw new InternalServerErrorException('An error occurred while updating the user');
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const result = await this.usersRepository.delete(id);
            if (result.affected === 0) {
                this.logger.warn(`User not found with ID: ${id}`);
                throw new NotFoundException('User not found');
            }
            this.logger.log(`User deleted successfully with ID: ${id}`);
        } catch (error) {
            this.logger.error(`Failed to delete user with ID: ${id}`, error.stack);
            throw new InternalServerErrorException('An error occurred while deleting the user');
        }
    }
}
