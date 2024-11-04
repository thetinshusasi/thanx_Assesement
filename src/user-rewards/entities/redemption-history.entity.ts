import { Reward } from '../../rewards/entities/reward.entity';
import { User } from '../../users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';


@Entity()
export class RedemptionHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id)
    user: User;

    @ManyToOne(() => Reward, (reward) => reward.id)
    reward: Reward;

    @CreateDateColumn()
    redeemedAt: Date;
}