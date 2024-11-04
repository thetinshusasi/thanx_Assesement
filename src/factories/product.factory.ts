import { setSeederFactory } from 'typeorm-extension';
import { Product } from '../products/entities/product.entity';
import { ProductCategory } from '../common/enums/product-category.enum';
import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';

const logger = new Logger('ProductSeeder');

export default setSeederFactory(Product, () => {
    const product = new Product();

    try {
        // Generate a random product name
        product.name = faker.commerce.productName();

        // Generate a random price and parse it as a float
        const price = faker.commerce.price();
        product.price = parseFloat(price);

        if (isNaN(product.price)) {
            throw new Error(`Failed to parse product price: ${price}`);
        }

        // Randomly assign a category to the product
        product.category = faker.helpers.arrayElement([
            ProductCategory.BEAUTY,
            ProductCategory.FASHION,
            // Add other categories if available
        ]);

        // Generate a random description for the product
        product.description = faker.lorem.sentence();

        // Log success
        logger.log(`Product created: ${product.name}, Category: ${product.category}, Price: ${product.price}`);
    } catch (error) {
        // Log error details
        logger.error(`Error creating product: ${error.message}`, error.stack);
        throw error;
    }

    return product;
});
