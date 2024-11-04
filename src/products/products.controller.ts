import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles/roles.decorator';
import { RolesGuard } from '../common/guards/roles/roles.guard';
import { UserRole } from '../users/models/enums/user-role.enum';
import { CreateProductDto } from './dtos/create-product.dto';
import { UpdateProductDto } from './dtos/update-product.dto';
import { ProductsService } from './products.service';
import { Logger } from 'nestjs-pino';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Products')
@ApiBearerAuth('bearer')
@Controller({
    path: 'products',
    version: '1',
})
export class ProductsController {
    constructor(
        private readonly productsService: ProductsService,
        private readonly logger: Logger,
    ) { }

    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    async create(@Body() createProductDto: CreateProductDto) {
        try {
            const product = await this.productsService.create(createProductDto);
            this.logger.log(`Product created successfully: ${product.id}`);
            return product;
        } catch (error) {
            this.logger.error(`Failed to create product: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while creating the product');
        }
    }

    @ApiOperation({ summary: 'Retrieve all products' })
    @ApiResponse({ status: 200, description: 'Fetched all products' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll() {
        try {
            const products = await this.productsService.findAll();
            this.logger.log('Fetched all products');
            return products;
        } catch (error) {
            this.logger.error(`Failed to fetch products: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while fetching products');
        }
    }

    @ApiOperation({ summary: 'Retrieve a product by ID' })
    @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
    @ApiResponse({ status: 200, description: 'Fetched product successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        try {
            const product = await this.productsService.findOne(+id);
            if (!product) {
                this.logger.warn(`Product not found with ID: ${id}`);
                throw new NotFoundException(`Product with ID ${id} not found`);
            }
            this.logger.log(`Fetched product with ID: ${id}`);
            return product;
        } catch (error) {
            this.logger.error(`Failed to fetch product with ID ${id}: ${error.message}`, error.stack);
            throw error instanceof NotFoundException
                ? error
                : new InternalServerErrorException('An error occurred while fetching the product');
        }
    }

    @ApiOperation({ summary: 'Update a product by ID' })
    @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
    @ApiResponse({ status: 200, description: 'Product updated successfully' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        try {
            const updatedProduct = await this.productsService.update(+id, updateProductDto);
            this.logger.log(`Product updated successfully: ${updatedProduct.id}`);
            return updatedProduct;
        } catch (error) {
            this.logger.error(`Failed to update product with ID ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while updating the product');
        }
    }

    @ApiOperation({ summary: 'Delete a product by ID' })
    @ApiParam({ name: 'id', description: 'Product ID', type: 'string' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            await this.productsService.remove(+id);
            this.logger.log(`Product deleted successfully with ID: ${id}`);
            return { message: 'Product deleted successfully' };
        } catch (error) {
            this.logger.error(`Failed to delete product with ID ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while deleting the product');
        }
    }
}
