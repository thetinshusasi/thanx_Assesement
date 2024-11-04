import {
    IsString,
    IsEnum,
    IsNumber,
    IsNotEmpty,
    Min,
} from 'class-validator';
import { ProductCategory } from '../../common/enums/product-category.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({
        description: 'The name of the product',
        example: 'Beauty Product 1',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'The price of the product',
        example: 19.99,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({
        description: 'The category of the product',
        example: ProductCategory.BEAUTY,
        enum: ProductCategory,
    })
    @IsEnum(ProductCategory)
    category: ProductCategory;

    @ApiProperty({
        description: 'A description of the product',
        example: 'A great beauty product that nourishes the skin',
    })
    @IsString()
    @IsNotEmpty()
    description: string;
}
