import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

@Entity()
export class UserRewards {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @Column()
  pointsBalance: number;

  @Column('simple-array')
  activeRewardsList: number[]; // Reward IDs

  @Column('simple-array')
  expiredRewardsList: number[]; // Reward IDs
}