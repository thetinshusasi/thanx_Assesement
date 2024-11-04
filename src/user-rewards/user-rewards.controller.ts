import { Controller, Get, UseGuards, Request, DefaultValuePipe, ParseIntPipe, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRewardsService } from './user-rewards.service';

@Controller({
    path: 'user-rewards',
    version: '1',
})
export class UserRewardsController {
    constructor(private readonly userRewardsService: UserRewardsService) { }

    @UseGuards(JwtAuthGuard)
    @Get('balance')
    async getPointsBalance(@Request() req) {
        const userId = req.user.id;
        return this.userRewardsService.getPointsBalance(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('redemption-history')
    async getRedemptionHistory(
        @Request() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        const userId = req.user.id;
        return this.userRewardsService.getRedemptionHistory(userId, page, limit);
    }

}