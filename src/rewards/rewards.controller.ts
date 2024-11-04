import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards, Request, DefaultValuePipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles/roles.decorator';
import { RolesGuard } from '../common/guards/roles/roles.guard';
import { UserRole } from '../users/models/enums/user-role.enum';
import { CreateRewardDto } from './dtos/create-reward.dto';
import { UpdateRewardDto } from './dtos/update-reward.dto';
import { RewardsService } from './rewards.service';


@Controller({
    path: 'rewards',
    version: '1',
})
export class RewardsController {
    constructor(private readonly rewardsService: RewardsService) { }

    // Admins can create new rewards
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    async create(@Body() createRewardDto: CreateRewardDto) {
        return this.rewardsService.create(createRewardDto);
    }

    // Any authenticated user can view rewards (with pagination)
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(
        @Query('page', new ParseIntPipe()) page = 1,
        @Query('limit', new ParseIntPipe()) limit = 10,
    ) {
        return this.rewardsService.findAll(page, limit);
    }

    // Any authenticated user can view a specific reward
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id', new ParseIntPipe()) id: number) {
        return this.rewardsService.findOne(id);
    }

    // Admins can update rewards
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    async update(
        @Param('id', new ParseIntPipe()) id: number,
        @Body() updateRewardDto: UpdateRewardDto,
    ) {
        return this.rewardsService.update(id, updateRewardDto);
    }

    // Admins can delete rewards
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async remove(@Param('id', new ParseIntPipe()) id: number) {
        return this.rewardsService.remove(id);
    }

    // Customers can claim a reward, which updates the 'Total Available Rewards Count'
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @Patch(':id/claim')
    async claimReward(@Param('id', new ParseIntPipe()) id: number, @Request() req) {
        // Here, you would include logic to check the user's points balance,
        // deduct the required points, and record the redemption history.
        // For simplicity, we'll focus on updating the reward's available count.

        // Decrement the available rewards count
        const updatedReward = await this.rewardsService.decrementAvailableRewardsCount(id);

        // TODO: Update user's points balance and redemption history

        return {
            message: 'Reward claimed successfully',
            reward: updatedReward,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllAvailable(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        return this.rewardsService.findAllAvailable(page, limit);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @Post(':id/redeem')
    async redeemReward(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
    ) {
        const userId = req.user.id;
        return this.rewardsService.redeemReward(userId, id);
    }

}