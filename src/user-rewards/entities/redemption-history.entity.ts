import { Reward } from '../../rewards/entities/reward.entity';
import { User } from '../../users/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class RedemptionHistory {
    @ApiProperty({
        description: 'The unique identifier of the redemption history record',
        example: 1,
    })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({
        description: 'The user who redeemed the reward',
        type: () => User,
    })
    @ManyToOne(() => User, (user) => user.id)
    user: User;

    @ApiProperty({
        description: 'The reward that was redeemed',
        type: () => Reward,
    })
    @ManyToOne(() => Reward, (reward) => reward.id)
    reward: Reward;

    @ApiProperty({
        description: 'The date and time when the reward was redeemed',
        example: '2023-12-01T10:30:00Z',
    })
    @CreateDateColumn()
    redeemedAt: Date;
}
