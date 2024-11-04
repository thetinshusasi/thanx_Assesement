import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { SeederOptions } from 'typeorm-extension';
import { Product } from './products/entities/product.entity';
import { Reward } from './rewards/entities/reward.entity';
import { Token } from './tokens/entities/token.entity';
import { RedemptionHistory } from './user-rewards/entities/redemption-history.entity';
import { UserRewards } from './user-rewards/entities/user-rewards.entity';
import { User } from './users/entities/user.entity';

config({ path: `.env.${process.env.NODE_ENV || 'development'}` });

const options: DataSourceOptions & SeederOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Product, Reward, UserRewards, Token, RedemptionHistory],
    migrations: ['dist/migrations/*{.ts,.js}'],
    seeds: ['src/seeds/**/*{.ts,.js}'], // Seeding configuration
    factories: ['src/factories/**/*{.ts,.js}'], // Factory configuration
};

const dataSource = new DataSource(options);

export default dataSource;