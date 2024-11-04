import {
    IsString,
    IsNumber,
    IsDateString,
    IsEnum,
} from 'class-validator';
import { ProductCategory } from '../../common/enums/product-category.enum';

export class CreateRewardDto {
    @IsString()
    name: string;

    @IsNumber()
    pointsRequired: number;

    @IsDateString()
    expiryDate: Date;

    @IsNumber()
    totalAvailableRewardsCount: number;

    @IsEnum(ProductCategory)
    applicableCategory: ProductCategory;
}