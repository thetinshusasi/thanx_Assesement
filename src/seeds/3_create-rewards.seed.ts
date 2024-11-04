
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Reward } from '../rewards/entities/reward.entity';
import { ProductCategory } from '../common/enums/product-category.enum';

export default class CreateRewards implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const rewardRepository = dataSource.getRepository(Reward);

        // Create specific rewards
        const reward1 = new Reward();
        reward1.name = '10% Discount';
        reward1.pointsRequired = 50;
        reward1.expiryDate = new Date('2025-12-31');
        reward1.totalAvailableRewardsCount = 100;
        reward1.applicableCategory = ProductCategory.FASHION;

        await rewardRepository.save(reward1);

        // Create random rewards using factory
        const rewardFactory = factoryManager.get(Reward);
        await rewardFactory.saveMany(10);
    }
}