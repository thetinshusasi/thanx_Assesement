import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Reward } from '../rewards/entities/reward.entity';
import { ProductCategory } from '../common/enums/product-category.enum';
import { Logger } from '@nestjs/common';

export default class CreateRewards implements Seeder {
    private readonly logger = new Logger(CreateRewards.name);

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const rewardRepository = dataSource.getRepository(Reward);

        try {
            // Create specific rewards
            const reward1 = new Reward();
            reward1.name = '10% Discount';
            reward1.pointsRequired = 50;
            reward1.expiryDate = new Date('2025-12-31');
            reward1.totalAvailableRewardsCount = 100;
            reward1.applicableCategory = ProductCategory.FASHION;

            await rewardRepository.save(reward1);
            this.logger.log('Specific reward created successfully.');

            // Create random rewards using factory
            const rewardFactory = factoryManager.get(Reward);
            await rewardFactory.saveMany(10);
            this.logger.log('Additional random rewards created successfully.');
        } catch (error) {
            this.logger.error('Error occurred while creating rewards', error.stack);
            throw error;
        }
    }
}
