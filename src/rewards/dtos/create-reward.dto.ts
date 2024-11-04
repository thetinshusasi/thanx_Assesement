import {
    IsString,
    IsNumber,
    IsDateString,
    IsEnum,
} from 'class-validator';
import { ProductCategory } from '../../common/enums/product-category.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRewardDto {
    @ApiProperty({
        description: 'The name of the reward',
        example: '10% Discount',
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Points required to claim the reward',
        example: 50,
    })
    @IsNumber()
    pointsRequired: number;

    @ApiProperty({
        description: 'The expiry date of the reward',
        example: '2025-12-31',
        type: String,
    })
    @IsDateString()
    expiryDate: Date;

    @ApiProperty({
        description: 'Total number of rewards available',
        example: 100,
    })
    @IsNumber()
    totalAvailableRewardsCount: number;

    @ApiProperty({
        description: 'The applicable product category for the reward',
        example: ProductCategory.FASHION,
        enum: ProductCategory,
    })
    @IsEnum(ProductCategory)
    applicableCategory: ProductCategory;
}
