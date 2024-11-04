import { ProductCategory } from "../../common/enums/product-category.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('decimal', { precision: 8, scale: 2 })
    price: number;

    @Column({
        type: 'enum',
        enum: ProductCategory,
    })
    category: ProductCategory;

    @Column('text')
    description: string;
}