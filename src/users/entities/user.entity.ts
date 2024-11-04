import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { UserRole } from '../models/enums/user-role.enum';


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string; // Should be hashed

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role: UserRole;
}