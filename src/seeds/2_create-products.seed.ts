
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { Product } from '../products/entities/product.entity';
import { ProductCategory } from '../common/enums/product-category.enum';

export default class CreateProducts implements Seeder {
    public async run(dataSource: DataSource, factoryManager: SeederFactoryManager): Promise<void> {
        const productRepository = dataSource.getRepository(Product);

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

        // Create random products using factory
        const productFactory = factoryManager.get(Product);
        await productFactory.saveMany(20);
    }
}
