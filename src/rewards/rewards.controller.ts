import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
    Request,
    DefaultValuePipe,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles/roles.decorator';
import { RolesGuard } from '../common/guards/roles/roles.guard';
import { UserRole } from '../users/models/enums/user-role.enum';
import { CreateRewardDto } from './dtos/create-reward.dto';
import { UpdateRewardDto } from './dtos/update-reward.dto';
import { RewardsService } from './rewards.service';
import { Logger } from 'nestjs-pino';

@Controller({
    path: 'rewards',
    version: '1',
})
export class RewardsController {

    constructor(private readonly rewardsService: RewardsService, private readonly logger: Logger,) { }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    async create(@Body() createRewardDto: CreateRewardDto) {
        try {
            const reward = await this.rewardsService.create(createRewardDto);
            this.logger.log(`Reward created successfully: ${reward.id}`);
            return reward;
        } catch (error) {
            this.logger.error(`Failed to create reward: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while creating the reward');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        try {
            const rewards = await this.rewardsService.findAll(page, limit);
            this.logger.log(`Fetched ${rewards.data.length} rewards`);
            return rewards;
        } catch (error) {
            this.logger.error(`Failed to fetch rewards: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while fetching rewards');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id', new ParseIntPipe()) id: number) {
        try {
            const reward = await this.rewardsService.findOne(id);
            if (!reward) {
                this.logger.warn(`Reward not found with ID: ${id}`);
                throw new NotFoundException(`Reward with ID ${id} not found`);
            }
            this.logger.log(`Fetched reward with ID: ${id}`);
            return reward;
        } catch (error) {
            this.logger.error(`Failed to fetch reward with ID ${id}: ${error.message}`, error.stack);
            throw error instanceof NotFoundException ? error : new InternalServerErrorException('An error occurred while fetching the reward');
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    async update(
        @Param('id', new ParseIntPipe()) id: number,
        @Body() updateRewardDto: UpdateRewardDto,
    ) {
        try {
            const updatedReward = await this.rewardsService.update(id, updateRewardDto);
            this.logger.log(`Reward updated successfully with ID: ${id}`);
            return updatedReward;
        } catch (error) {
            this.logger.error(`Failed to update reward with ID ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while updating the reward');
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async remove(@Param('id', new ParseIntPipe()) id: number) {
        try {
            await this.rewardsService.remove(id);
            this.logger.log(`Reward deleted successfully with ID: ${id}`);
            return { message: 'Reward deleted successfully' };
        } catch (error) {
            this.logger.error(`Failed to delete reward with ID ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while deleting the reward');
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @Patch(':id/claim')
    async claimReward(@Param('id', new ParseIntPipe()) id: number, @Request() req) {
        try {
            const updatedReward = await this.rewardsService.decrementAvailableRewardsCount(id);
            this.logger.log(`Reward claimed successfully with ID: ${id} by user ID: ${req.user.id}`);
            return {
                message: 'Reward claimed successfully',
                reward: updatedReward,
            };
        } catch (error) {
            this.logger.error(`Failed to claim reward with ID ${id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while claiming the reward');
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('available')
    async findAllAvailable(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    ) {
        try {
            const rewards = await this.rewardsService.findAllAvailable(page, limit);
            this.logger.log(`Fetched ${rewards.data.length} available rewards`);
            return rewards;
        } catch (error) {
            this.logger.error(`Failed to fetch available rewards: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while fetching available rewards');
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @Post(':id/redeem')
    async redeemReward(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
    ) {
        try {
            const userId = req.user.id;
            const reward = await this.rewardsService.redeemReward(userId, id);
            this.logger.log(`Reward redeemed successfully with ID: ${id} by user ID: ${userId}`);
            return reward;
        } catch (error) {
            this.logger.error(`Failed to redeem reward with ID ${id} for user ID: ${req.user.id}: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while redeeming the reward');
        }
    }
}
