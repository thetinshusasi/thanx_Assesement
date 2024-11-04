import {
    BadRequestException,
    Injectable,
    NotFoundException,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { CreateRewardDto } from './dtos/create-reward.dto';
import { UpdateRewardDto } from './dtos/update-reward.dto';
import { Reward } from './entities/reward.entity';
import { RedemptionHistory } from '../user-rewards/entities/redemption-history.entity';
import { UserRewards } from '../user-rewards/entities/user-rewards.entity';
import { User } from '../users/entities/user.entity';
import { Logger } from 'nestjs-pino';

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
        private readonly logger: Logger,
    ) { }

    async create(createRewardDto: CreateRewardDto): Promise<Reward> {
        try {
            const reward = this.rewardsRepository.create(createRewardDto);
            const savedReward = await this.rewardsRepository.save(reward);
            this.logger.log(`Reward created successfully with ID: ${savedReward.id}`);
            return savedReward;
        } catch (error) {
            this.logger.error(`Failed to create reward: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while creating the reward');
        }
    }

    async findAll(
        page = 1,
        limit = 10,
    ): Promise<{ data: Reward[]; total: number }> {
        try {
            const [data, total] = await this.rewardsRepository.findAndCount({
                skip: (page - 1) * limit,
                take: limit,
            });
            this.logger.log(`Fetched ${total} rewards`);
            return { data, total };
        } catch (error) {
            this.logger.error(`Failed to fetch rewards: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while fetching rewards');
        }
    }

    async findOne(id: number): Promise<Reward> {
        try {
            const reward = await this.rewardsRepository.findOneBy({ id });
            if (!reward) {
                this.logger.warn(`Reward not found with ID: ${id}`);
                throw new NotFoundException('Reward not found');
            }
            this.logger.log(`Fetched reward with ID: ${id}`);
            return reward;
        } catch (error) {
            this.logger.error(`Failed to fetch reward with ID ${id}: ${error.message}`, error.stack);
            throw error instanceof NotFoundException ? error : new InternalServerErrorException('An error occurred while fetching the reward');
        }
    }

    async update(id: number, updateRewardDto: UpdateRewardDto): Promise<Reward> {
        try {
            const reward = await this.findOne(id);
            Object.assign(reward, updateRewardDto);
            const updatedReward = await this.rewardsRepository.save(reward);
            this.logger.log(`Reward updated successfully with ID: ${id}`);
            return updatedReward;
        } catch (error) {
            this.logger.error(`Failed to update reward with ID ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while updating the reward');
        }
    }

    async remove(id: number): Promise<void> {
        try {
            const reward = await this.findOne(id);
            await this.rewardsRepository.remove(reward);
            this.logger.log(`Reward deleted successfully with ID: ${id}`);
        } catch (error) {
            this.logger.error(`Failed to delete reward with ID ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while deleting the reward');
        }
    }

    // async decrementAvailableRewardsCount(id: number): Promise<Reward> {
    //     try {
    //         const reward = await this.findOne(id);
    //         if (reward.totalAvailableRewardsCount <= 0) {
    //             this.logger.warn(`No rewards available to claim for ID: ${id}`);
    //             throw new BadRequestException('No rewards available to claim');
    //         }
    //         reward.totalAvailableRewardsCount -= 1;
    //         const updatedReward = await this.rewardsRepository.save(reward);
    //         this.logger.log(`Decremented reward count for ID: ${id}`);
    //         return updatedReward;
    //     } catch (error) {
    //         this.logger.error(`Failed to decrement reward count for ID ${id}: ${error.message}`, error.stack);
    //         throw error instanceof BadRequestException ? error : new InternalServerErrorException('An error occurred while claiming the reward');
    //     }
    // }

    async findAllAvailable(
        page = 1,
        limit = 10,
    ): Promise<{ data: Reward[]; total: number }> {
        try {
            const [data, total] = await this.rewardsRepository.findAndCount({
                where: {
                    totalAvailableRewardsCount: MoreThan(0),
                    expiryDate: MoreThan(new Date()),
                },
                skip: (page - 1) * limit,
                take: limit,
            });
            this.logger.log(`Fetched ${total} available rewards`);
            return { data, total };
        } catch (error) {
            this.logger.error(`Failed to fetch available rewards: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while fetching available rewards');
        }
    }

    async redeemReward(userId: number, rewardId: number): Promise<any> {
        try {
            const reward = await this.findOne(rewardId);
            if (reward.totalAvailableRewardsCount <= 0) {
                this.logger.warn(`Reward with ID ${rewardId} is no longer available`);
                throw new BadRequestException('Reward is no longer available');
            }
            if (reward.expiryDate <= new Date()) {
                this.logger.warn(`Reward with ID ${rewardId} has expired`);
                throw new BadRequestException('Reward has expired');
            }

            const userRewards = await this.userRewardsRepository.findOne({
                where: { user: { id: userId } },
                relations: ['user'],
            });
            if (!userRewards) {
                this.logger.warn(`User rewards not found for user ID: ${userId}`);
                throw new NotFoundException('User rewards not found');
            }

            if (userRewards.pointsBalance < reward.pointsRequired) {
                this.logger.warn(`Insufficient points for user ID: ${userId} to redeem reward ID: ${rewardId}`);
                throw new BadRequestException('Insufficient points to redeem this reward');
            }

            userRewards.pointsBalance -= reward.pointsRequired;
            await this.userRewardsRepository.save(userRewards);

            reward.totalAvailableRewardsCount -= 1;
            await this.rewardsRepository.save(reward);

            const redemption = new RedemptionHistory();
            redemption.user = userRewards.user;
            redemption.reward = reward;
            redemption.redeemedAt = new Date();
            await this.redemptionHistoryRepository.save(redemption);

            this.logger.log(`Reward redeemed successfully with ID: ${rewardId} by user ID: ${userId}`);
            return { message: 'Reward redeemed successfully' };
        } catch (error) {
            this.logger.error(`Failed to redeem reward with ID ${rewardId} for user ID ${userId}: ${error.message}`, error.stack);
            throw error instanceof NotFoundException || error instanceof BadRequestException
                ? error
                : new InternalServerErrorException('An error occurred while redeeming the reward');
        }
    }
}
