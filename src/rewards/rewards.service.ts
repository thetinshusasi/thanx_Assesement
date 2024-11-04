import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { CreateRewardDto } from './dtos/create-reward.dto';
import { UpdateRewardDto } from './dtos/update-reward.dto';
import { Reward } from './entities/reward.entity';
import { RedemptionHistory } from '../user-rewards/entities/redemption-history.entity';
import { UserRewards } from '../user-rewards/entities/user-rewards.entity';
import { User } from '../users/entities/user.entity';


@Injectable()
export class RewardsService {
    constructor(
        @InjectRepository(Reward)
        private readonly rewardsRepository: Repository<Reward>,
        @InjectRepository(UserRewards)
        private readonly userRewardsRepository: Repository<UserRewards>,
        @InjectRepository(RedemptionHistory)
        private readonly redemptionHistoryRepository: Repository<RedemptionHistory>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createRewardDto: CreateRewardDto): Promise<Reward> {
        const reward = this.rewardsRepository.create(createRewardDto);
        return this.rewardsRepository.save(reward);
    }

    async findAll(
        page = 1,
        limit = 10,
    ): Promise<{ data: Reward[]; total: number }> {
        const [data, total] = await this.rewardsRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }

    async findOne(id: number): Promise<Reward> {
        const reward = await this.rewardsRepository.findOneBy({ id });
        if (!reward) {
            throw new NotFoundException('Reward not found');
        }
        return reward;
    }

    async update(
        id: number,
        updateRewardDto: UpdateRewardDto,
    ): Promise<Reward> {
        const reward = await this.findOne(id);
        Object.assign(reward, updateRewardDto);
        return this.rewardsRepository.save(reward);
    }

    async remove(id: number): Promise<void> {
        const reward = await this.findOne(id);
        await this.rewardsRepository.remove(reward);
    }

    // Method to update the 'Total Available Rewards Count' when claiming the reward
    async decrementAvailableRewardsCount(id: number): Promise<Reward> {
        const reward = await this.findOne(id);
        if (reward.totalAvailableRewardsCount <= 0) {
            throw new BadRequestException('No rewards available to claim');
        }
        reward.totalAvailableRewardsCount -= 1;
        return this.rewardsRepository.save(reward);
    }

    async findAllAvailable(
        page = 1,
        limit = 10,
    ): Promise<{ data: Reward[]; total: number }> {
        const [data, total] = await this.rewardsRepository.findAndCount({
            where: {
                totalAvailableRewardsCount: MoreThan(0),
                expiryDate: MoreThan(new Date()),
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total };
    }
    async redeemReward(userId: number, rewardId: number): Promise<any> {
        // Fetch the reward
        const reward = await this.rewardsRepository.findOneBy({ id: rewardId });
        if (!reward) {
            throw new NotFoundException('Reward not found');
        }

        if (reward.totalAvailableRewardsCount <= 0) {
            throw new BadRequestException('Reward is no longer available');
        }

        if (reward.expiryDate <= new Date()) {
            throw new BadRequestException('Reward has expired');
        }

        // Fetch the user's reward balance
        const userRewards = await this.userRewardsRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!userRewards) {
            throw new NotFoundException('User rewards not found');
        }

        // Check if the user has enough points
        if (userRewards.pointsBalance < reward.pointsRequired) {
            throw new BadRequestException('Insufficient points to redeem this reward');
        }

        // Deduct points from user's balance
        userRewards.pointsBalance -= reward.pointsRequired;
        await this.userRewardsRepository.save(userRewards);

        // Decrement the reward's available count
        reward.totalAvailableRewardsCount -= 1;
        await this.rewardsRepository.save(reward);

        // Record redemption history
        const redemption = new RedemptionHistory();
        redemption.user = userRewards.user;
        redemption.reward = reward;
        redemption.redeemedAt = new Date();
        await this.redemptionHistoryRepository.save(redemption);

        return { message: 'Reward redeemed successfully' };
    }
}

