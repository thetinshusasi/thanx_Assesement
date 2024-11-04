import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class UserRewards {
  @ApiProperty({
    description: 'The unique identifier of the user rewards record',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The user associated with the rewards',
    type: () => User,
  })
  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ApiProperty({
    description: 'The current points balance of the user',
    example: 500,
  })
  @Column()
  pointsBalance: number;

  @ApiProperty({
    description: 'A list of active reward IDs for the user',
    example: [1, 2, 3],
    type: [Number],
  })
  @Column('simple-array')
  activeRewardsList: number[]; // Reward IDs

  @ApiProperty({
    description: 'A list of expired reward IDs for the user',
    example: [4, 5],
    type: [Number],
  })
  @Column('simple-array')
  expiredRewardsList: number[]; // Reward IDs
}
