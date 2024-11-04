import { setSeederFactory } from 'typeorm-extension';
import { Product } from '../products/entities/product.entity';
import { ProductCategory } from '../common/enums/product-category.enum';
import { faker } from '@faker-js/faker';

export default setSeederFactory(Product, () => {
    const product = new Product();
    product.name = faker.commerce.productName();
    product.price = parseFloat(faker.commerce.price());
    product.category = faker.helpers.arrayElement([
        ProductCategory.BEAUTY,
        ProductCategory.FASHION,
        // Add other categories if available
    ]);
    product.description = faker.lorem.sentence();

    return product;
});