import {
    IsString,
    IsEnum,
    IsNumber,
    IsNotEmpty,
    Min,
} from 'class-validator';
import { ProductCategory } from '../../common/enums/product-category.enum';

export class CreateProductDto {
    @IsString()
    name: string;

    @IsNumber()
    @Min(0)
    price: number;

    @IsEnum(ProductCategory)
    category: ProductCategory;

    @IsString()
    @IsNotEmpty()
    description: string;
}