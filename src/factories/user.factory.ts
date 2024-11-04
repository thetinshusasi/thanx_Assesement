import { setSeederFactory } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/models/enums/user-role.enum';
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';

const logger = new Logger('UserSeeder');

export default setSeederFactory(User, () => {
    const user = new User();

    try {
        // Generate random user details
        user.name = faker.name.fullName();
        user.email = faker.internet.email();

        // Hash the default password
        const plainPassword = 'password123';
        user.password = bcrypt.hashSync(plainPassword, 10);

        // Assign a default role
        user.role = UserRole.CUSTOMER;

        // Log successful creation
        logger.log(`User created: Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
    } catch (error) {
        // Log error details
        logger.error(`Error creating user: ${error.message}`, error.stack);
        throw error; // Rethrow to propagate the error to the seeder system
    }

    return user;
});
