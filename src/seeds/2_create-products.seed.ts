import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductCategory } from '../common/enums/product-category.enum';
import { Logger } from '@nestjs/common';

export default class CreateProducts implements Seeder {
    private readonly logger = new Logger(CreateProducts.name);

    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const productRepository = dataSource.getRepository(Product);

        try {
            // Create specific products
            const product1 = new Product();
            product1.name = 'Beauty Product 1';
            product1.price = 19.99;
            product1.category = ProductCategory.BEAUTY;
            product1.description = 'A great beauty product';

            const product2 = new Product();
            product2.name = 'Fashion Item 1';
            product2.price = 49.99;
            product2.category = ProductCategory.FASHION;
            product2.description = 'A stylish fashion item';

            await productRepository.save([product1, product2]);
            this.logger.log('Specific products created successfully.');

            // Create random products using factory
            const productFactory = factoryManager.get(Product);
            await productFactory.saveMany(20);
            this.logger.log('Additional random products created successfully.');
        } catch (error) {
            this.logger.error('Error occurred while creating products', error.stack);
            throw error;
        }
    }
}
