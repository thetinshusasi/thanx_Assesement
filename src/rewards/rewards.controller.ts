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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Rewards')
@ApiBearerAuth('bearer')
@Controller({
    path: 'rewards',
    version: '1',
})
export class RewardsController {
    constructor(
        private readonly rewardsService: RewardsService,
        private readonly logger: Logger,
    ) { }



    @ApiOperation({ summary: 'Create a new reward' })
    @ApiResponse({ status: 201, description: 'Reward created successfully' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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

    @ApiOperation({ summary: 'Retrieve all rewards with pagination' })
    @ApiResponse({ status: 200, description: 'Fetched all rewards' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
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


    @ApiOperation({ summary: 'Retrieve all available rewards with pagination' })
    @ApiResponse({ status: 200, description: 'Fetched all available rewards' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
    @UseGuards(JwtAuthGuard)
    @Get('available')
    async findAllAvailable(
        @Request() req,
    ) {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 100;
            const rewards = await this.rewardsService.findAllAvailable(page, limit);
            this.logger.log(`Fetched ${rewards.data.length} available rewards`);
            return rewards;
        } catch (error) {
            this.logger.error(`Failed to fetch available rewards: ${error.message}`, error.stack);
            throw new InternalServerErrorException('An error occurred while fetching available rewards');
        }
    }


    @ApiOperation({ summary: 'Retrieve a reward by ID' })
    @ApiParam({ name: 'id', description: 'Reward ID', type: 'integer' })
    @ApiResponse({ status: 200, description: 'Fetched reward successfully' })
    @ApiResponse({ status: 404, description: 'Reward not found' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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
            throw error instanceof NotFoundException
                ? error
                : new InternalServerErrorException('An error occurred while fetching the reward');
        }
    }

    @ApiOperation({ summary: 'Update a reward by ID' })
    @ApiParam({ name: 'id', description: 'Reward ID', type: 'integer' })
    @ApiResponse({ status: 200, description: 'Reward updated successfully' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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



    @ApiOperation({ summary: 'Delete a reward by ID' })
    @ApiParam({ name: 'id', description: 'Reward ID', type: 'integer' })
    @ApiResponse({ status: 200, description: 'Reward deleted successfully' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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

    // @ApiOperation({ summary: 'Claim a reward by ID for a customer' })
    // @ApiParam({ name: 'id', description: 'Reward ID', type: 'integer' })
    // @ApiResponse({ status: 200, description: 'Reward claimed successfully' })
    // @ApiResponse({ status: 500, description: 'Internal server error' })
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(UserRole.CUSTOMER)
    // @Patch(':id/claim')
    // async claimReward(@Param('id', new ParseIntPipe()) id: number, @Request() req) {
    //     try {
    //         const updatedReward = await this.rewardsService.decrementAvailableRewardsCount(id);
    //         this.logger.log(`Reward claimed successfully with ID: ${id} by user ID: ${req.user.id}`);
    //         return {
    //             message: 'Reward claimed successfully',
    //             reward: updatedReward,
    //         };
    //     } catch (error) {
    //         this.logger.error(`Failed to claim reward with ID ${id}: ${error.message}`, error.stack);
    //         throw new InternalServerErrorException('An error occurred while claiming the reward');
    //     }
    // }



    @ApiOperation({ summary: 'Redeem a reward by ID for a customer' })
    @ApiParam({ name: 'id', description: 'Reward ID', type: 'integer' })
    @ApiResponse({ status: 200, description: 'Reward redeemed successfully' })
    @ApiResponse({ status: 500, description: 'Internal server error' })
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
