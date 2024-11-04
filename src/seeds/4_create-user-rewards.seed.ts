import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserRewards } from '../user-rewards/entities/user-rewards.entity';
import { User } from '../users/entities/user.entity';
import { Logger } from '@nestjs/common';

export default class CreateUserRewards implements Seeder {
    private readonly logger = new Logger(CreateUserRewards.name);

    public async run(dataSource: DataSource): Promise<void> {
        const userRepository = dataSource.getRepository(User);
        const userRewardsRepository = dataSource.getRepository(UserRewards);

        try {
            const users = await userRepository.find();

            if (users.length === 0) {
                this.logger.warn('No users found to assign rewards.');
                return;
            }

            for (const user of users) {
                const userRewards = new UserRewards();
                userRewards.user = user;
                userRewards.pointsBalance = 500; // Initial points balance
                userRewards.activeRewardsList = [];
                userRewards.expiredRewardsList = [];

                await userRewardsRepository.save(userRewards);
                this.logger.log(`User rewards created successfully for user ID: ${user.id}`);
            }
            this.logger.log('User rewards setup completed successfully for all users.');
        } catch (error) {
            this.logger.error('Error occurred while creating user rewards', error.stack);
            throw error;
        }
    }
}
