import { Module } from '@nestjs/common';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from './entities/reward.entity';
import { RedemptionHistory } from '../user-rewards/entities/redemption-history.entity';
import { UserRewards } from '../user-rewards/entities/user-rewards.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reward, UserRewards, RedemptionHistory, User]),
  ],
  providers: [RewardsService],
  controllers: [RewardsController],
})
export class RewardsModule { }
