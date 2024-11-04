import { ProductCategory } from '../../common/enums/product-category.enum';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Reward {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    pointsRequired: number;

    @Column('date')
    expiryDate: Date;

    @Column()
    totalAvailableRewardsCount: number;

    @Column({
        type: 'enum',
        enum: ProductCategory,
    })
    applicableCategory: ProductCategory;
}