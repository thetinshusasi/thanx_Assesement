import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRole } from '../models/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
    @ApiProperty({
        description: 'The unique identifier of the user',
        example: 1,
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'The name of the user',
        example: 'John Doe',
    })
    @Column()
    name: string;

    @ApiProperty({
        description: 'The email address of the user, must be unique',
        example: 'john.doe@example.com',
    })
    @Column({ unique: true })
    email: string;

    @ApiProperty({
        description: 'The hashed password of the user',
        example: 'hashed_password_123456', // example is illustrative; should be hashed in real implementation
    })
    @Column()
    password: string;

    @ApiProperty({
        description: 'The role of the user',
        example: UserRole.CUSTOMER,
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role: UserRole;
}
