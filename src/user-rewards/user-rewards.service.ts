import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserRewards } from "./entities/user-rewards.entity";
import { RedemptionHistory } from "./entities/redemption-history.entity";

@Injectable()
export class UserRewardsService {
    constructor(
        @InjectRepository(UserRewards)
        private readonly userRewardsRepository: Repository<UserRewards>,
        @InjectRepository(RedemptionHistory)
        private readonly redemptionHistoryRepository: Repository<RedemptionHistory>,
    ) { }

    // Method to retrieve user's current points balance
    async getPointsBalance(userId: number): Promise<{ pointsBalance: number }> {
        const userRewards = await this.userRewardsRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!userRewards) {
            throw new NotFoundException('User rewards not found');
        }
        return { pointsBalance: userRewards.pointsBalance };
    }

    async getRedemptionHistory(
        userId: number,
        page = 1,
        limit = 10,
    ): Promise<{ data: RedemptionHistory[]; total: number }> {
        const [data, total] = await this.redemptionHistoryRepository.findAndCount({
            where: { user: { id: userId } },
            relations: ['reward'],
            skip: (page - 1) * limit,
            take: limit,
            order: { redeemedAt: 'DESC' },
        });
        return { data, total };
    }



}