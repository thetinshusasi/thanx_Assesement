import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/models/enums/user-role.enum';
import { Logger } from '@nestjs/common';

export default class CreateUsers implements Seeder {
    private readonly logger = new Logger(CreateUsers.name);

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const userRepository = dataSource.getRepository(User);

        try {
            // Create Admin User
            const adminUser = new User();
            adminUser.name = 'Admin';
            adminUser.email = 'admin@example.com';
            adminUser.password = bcrypt.hashSync('admin123', 10);
            adminUser.role = UserRole.ADMIN;

            // Create Customer Users
            const user1 = new User();
            user1.name = 'User1';
            user1.email = 'user1@example.com';
            user1.password = bcrypt.hashSync('user123', 10);
            user1.role = UserRole.CUSTOMER;

            const user2 = new User();
            user2.name = 'User2';
            user2.email = 'user2@example.com';
            user2.password = bcrypt.hashSync('user123', 10);
            user2.role = UserRole.CUSTOMER;

            // Save the users to the database
            await userRepository.save([adminUser, user1, user2]);
            this.logger.log('Admin and initial customer users created successfully.');

            // Optionally create additional random users using factory
            const userFactory = factoryManager.get(User);
            await userFactory.saveMany(5);
            this.logger.log('Additional random users created successfully.');
        } catch (error) {
            this.logger.error('Error occurred while creating users', error.stack);
            throw error;
        }
    }
}
