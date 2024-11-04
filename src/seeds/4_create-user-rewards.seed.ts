
import { Seeder } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { UserRewards } from '../user-rewards/entities/user-rewards.entity';
import { User } from '../users/entities/user.entity';

export default class CreateUserRewards implements Seeder {
    public async run(dataSource: DataSource): Promise<void> {
        const userRepository = dataSource.getRepository(User);
        const userRewardsRepository = dataSource.getRepository(UserRewards);

        const users = await userRepository.find();

        for (const user of users) {
            const userRewards = new UserRewards();
            userRewards.user = user;
            userRewards.pointsBalance = 500; // Initial points balance
            userRewards.activeRewardsList = [];
            userRewards.expiredRewardsList = [];

            await userRewardsRepository.save(userRewards);
        }
    }
}
