import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product) private productsRepository: Repository<Product>,
        private readonly logger: Logger,
    ) { }

    async create(createProductDto: CreateProductDto): Promise<Product> {
        try {
            const product = this.productsRepository.create(createProductDto);
            const savedProduct = await this.productsRepository.save(product);
            this.logger.log(`Product created successfully with ID: ${savedProduct.id}`);
            return savedProduct;
        } catch (error) {
            this.logger.error(`Failed to create product: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while creating the product');
        }
    }

    async findAll(): Promise<Product[]> {
        try {
            const products = await this.productsRepository.find();
            this.logger.log(`Fetched ${products.length} products`);
            return products;
        } catch (error) {
            this.logger.error(`Failed to fetch products: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while fetching products');
        }
    }

    async findOne(id: number): Promise<Product> {
        try {
            const product = await this.productsRepository.findOneBy({ id });
            if (!product) {
                this.logger.warn(`Product not found with ID: ${id}`);
                throw new NotFoundException(`Product with ID ${id} not found`);
            }
            this.logger.log(`Fetched product with ID: ${id}`);
            return product;
        } catch (error) {
            this.logger.error(`Failed to fetch product with ID ${id}: ${error.message}`, error.stack);
            throw error instanceof NotFoundException ? error : new InternalServerErrorException('An error occurred while fetching the product');
        }
    }

    async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
        try {
            const result = await this.productsRepository.update(id, updateProductDto);
            if (result.affected === 0) {
                this.logger.warn(`No product found to update with ID: ${id}`);
                throw new NotFoundException(`Product with ID ${id} not found`);
            }
            const updatedProduct = await this.findOne(id);
            this.logger.log(`Product updated successfully with ID: ${id}`);
            return updatedProduct;
        } catch (error) {
            this.logger.error(`Failed to update product with ID ${id}: ${error.message}`, error.stack);
            throw error instanceof NotFoundException ? error : new InternalServerErrorException('An error occurred while updating the product');
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const result = await this.productsRepository.delete(id);
            if (result.affected === 0) {
                this.logger.warn(`No product found to delete with ID: ${id}`);
                throw new NotFoundException(`Product with ID ${id} not found`);
            }
            this.logger.log(`Product deleted successfully with ID: ${id}`);
        } catch (error) {
            this.logger.error(`Failed to delete product with ID ${id}: ${error.message}`, error.stack);
            throw error instanceof NotFoundException ? error : new InternalServerErrorException('An error occurred while deleting the product');
        }
    }
}
