import { Injectable, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRewards } from "./entities/user-rewards.entity";
import { RedemptionHistory } from "./entities/redemption-history.entity";
import { Logger } from "@nestjs/common";

@Injectable()
export class UserRewardsService {
    private readonly logger = new Logger(UserRewardsService.name);

    constructor(
        @InjectRepository(UserRewards)
        private readonly userRewardsRepository: Repository<UserRewards>,
        @InjectRepository(RedemptionHistory)
        private readonly redemptionHistoryRepository: Repository<RedemptionHistory>,
    ) { }

    // Method to retrieve user's current points balance
    async getPointsBalance(userId: number): Promise<{ pointsBalance: number }> {
        try {
            const userRewards = await this.userRewardsRepository.findOne({
                where: { user: { id: userId } },
                relations: ['user'],
            });
            if (!userRewards) {
                this.logger.warn(`User rewards not found for user ID: ${userId}`);
                throw new NotFoundException('User rewards not found');
            }
            this.logger.log(`Fetched points balance for user ID: ${userId}`);
            return { pointsBalance: userRewards.pointsBalance };
        } catch (error) {
            this.logger.error(`Failed to fetch points balance for user ID: ${userId}`, error.stack);
            throw error instanceof NotFoundException ? error : new InternalServerErrorException('An error occurred while fetching the points balance');
        }
    }

    async getRedemptionHistory(
        userId: number,
        page = 1,
        limit = 10,
    ): Promise<{ data: RedemptionHistory[]; total: number }> {
        try {
            const [data, total] = await this.redemptionHistoryRepository.findAndCount({
                where: { user: { id: userId } },
                relations: ['reward'],
                skip: (page - 1) * limit,
                take: limit,
                order: { redeemedAt: 'DESC' },
            });
            this.logger.log(`Fetched redemption history for user ID: ${userId}, Page: ${page}, Limit: ${limit}`);
            return { data, total };
        } catch (error) {
            this.logger.error(`Failed to fetch redemption history for user ID: ${userId}`, error.stack);
            throw new InternalServerErrorException('An error occurred while fetching the redemption history');
        }
    }
}
