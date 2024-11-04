import { ProductCategory } from "../../common/enums/product-category.enum";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Product {
    @ApiProperty({
        description: 'The unique identifier of the product',
        example: 1,
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'The name of the product',
        example: 'Beauty Product 1',
    })
    @Column()
    name: string;

    @ApiProperty({
        description: 'The price of the product',
        example: 19.99,
    })
    @Column('decimal', { precision: 8, scale: 2 })
    price: number;

    @ApiProperty({
        description: 'The category of the product',
        example: ProductCategory.BEAUTY,
        enum: ProductCategory,
    })
    @Column({
        type: 'enum',
        enum: ProductCategory,
    })
    category: ProductCategory;

    @ApiProperty({
        description: 'A description of the product',
        example: 'A great beauty product that nourishes the skin',
    })
    @Column('text')
    description: string;
}
