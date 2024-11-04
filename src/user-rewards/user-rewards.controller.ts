import {
    Controller,
    Get,
    UseGuards,
    Request,
    DefaultValuePipe,
    ParseIntPipe,
    Query,
    InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRewardsService } from './user-rewards.service';
import { Logger } from 'nestjs-pino';

@Controller({
    path: 'user-rewards',
    version: '1',
})
export class UserRewardsController {

    constructor(private readonly userRewardsService: UserRewardsService, private readonly logger: Logger,) { }

    @UseGuards(JwtAuthGuard)
    @Get('balance')
    async getPointsBalance(@Request() req) {
        const userId = req.user.id;
        try {
            const balance = await this.userRewardsService.getPointsBalance(userId);
            this.logger.log(`Fetched points balance for user ID: ${userId}`);
            return balance;
        } catch (error) {
            this.logger.error(`Failed to fetch points balance for user ID: ${userId}`, error.stack);
            throw new InternalServerErrorException('An error occurred while fetching the points balance');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('redemption-history')
    async getRedemptionHistory(
        @Request() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        const userId = req.user.id;
        try {
            const history = await this.userRewardsService.getRedemptionHistory(userId, page, limit);
            this.logger.log(`Fetched redemption history for user ID: ${userId}`);
            return history;
        } catch (error) {
            this.logger.error(`Failed to fetch redemption history for user ID: ${userId}`, error.stack);
            throw new InternalServerErrorException('An error occurred while fetching the redemption history');
        }
    }
}
