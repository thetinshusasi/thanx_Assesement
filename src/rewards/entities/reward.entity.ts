import { ProductCategory } from '../../common/enums/product-category.enum';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Reward {
    @ApiProperty({
        description: 'The unique identifier of the reward',
        example: 1,
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'The name of the reward',
        example: '10% Discount',
    })
    @Column()
    name: string;

    @ApiProperty({
        description: 'Points required to claim the reward',
        example: 50,
    })
    @Column()
    pointsRequired: number;

    @ApiProperty({
        description: 'The expiry date of the reward',
        example: '2025-12-31',
        type: String,
    })
    @Column('date')
    expiryDate: Date;

    @ApiProperty({
        description: 'Total number of rewards available',
        example: 100,
    })
    @Column()
    totalAvailableRewardsCount: number;

    @ApiProperty({
        description: 'The applicable product category for the reward',
        example: ProductCategory.FASHION,
        enum: ProductCategory,
    })
    @Column({
        type: 'enum',
        enum: ProductCategory,
    })
    applicableCategory: ProductCategory;
}
