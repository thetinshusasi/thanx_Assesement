import { Module } from '@nestjs/common';
import { UserRewardsController } from './user-rewards.controller';
import { UserRewardsService } from './user-rewards.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedemptionHistory } from './entities/redemption-history.entity';
import { UserRewards } from './entities/user-rewards.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserRewards, RedemptionHistory])],
  providers: [UserRewardsService],
  controllers: [UserRewardsController],
  exports: [UserRewardsService],
})
export class UserRewardsModule { }
