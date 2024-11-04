
import { setSeederFactory } from 'typeorm-extension';
import { ProductCategory } from '../common/enums/product-category.enum';
import { Reward } from '../rewards/entities/reward.entity';
import { faker } from '@faker-js/faker';

export default setSeederFactory(Reward, () => {
    const reward = new Reward();
    reward.name = `${faker.lorem.words(2)} Reward`;
    reward.pointsRequired = faker.number.int({ min: 10, max: 100 });
    reward.expiryDate = faker.date.future();
    reward.totalAvailableRewardsCount = faker.number.int({ min: 1, max: 50 });
    reward.applicableCategory = faker.helpers.arrayElement([
        ProductCategory.BEAUTY,
        ProductCategory.FASHION,
        ProductCategory.CLOTHING,
    ]);

    return reward;
});