import { setSeederFactory } from 'typeorm-extension';
import { ProductCategory } from '../common/enums/product-category.enum';
import { Reward } from '../rewards/entities/reward.entity';
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';

const logger = new Logger('RewardSeeder');

export default setSeederFactory(Reward, () => {
    const reward = new Reward();

    try {
        // Generate a random reward name
        reward.name = `${faker.lorem.words(2)} Reward`;

        // Generate a random points requirement within a specified range
        reward.pointsRequired = faker.number.int({ min: 10, max: 100 });

        // Generate a future expiry date
        reward.expiryDate = faker.date.future();

        // Generate a random count of available rewards
        reward.totalAvailableRewardsCount = faker.number.int({ min: 1, max: 50 });

        // Assign a random applicable category
        reward.applicableCategory = faker.helpers.arrayElement([
            ProductCategory.BEAUTY,
            ProductCategory.FASHION,
            ProductCategory.CLOTHING,
        ]);

        // Log successful creation
        logger.log(`Reward created: ${reward.name}, Points Required: ${reward.pointsRequired}, Category: ${reward.applicableCategory}`);
    } catch (error) {
        // Log error details
        logger.error(`Error creating reward: ${error.message}`, error.stack);
        throw error; // Rethrow to propagate the error up to the seeder system
    }

    return reward;
});
