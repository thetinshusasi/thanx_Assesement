import dataSource from './ormconfig'; // Adjust the path if ormconfig is in a different directory
import { runSeeders } from 'typeorm-extension';
import { Logger } from '@nestjs/common';

const logger = new Logger('SeederScript');

async function runSeeds() {
    try {
        // Initialize the data source
        await dataSource.initialize();
        logger.log('Data source initialized successfully.');

        // Synchronize the database (drops and recreates tables based on entities)
        await dataSource.synchronize(true);
        logger.log('Database synchronized successfully.');

        // Run seeders
        await runSeeders(dataSource);
        logger.log('Seeding complete!');
    } catch (error) {
        logger.error('Error during seeding:', error.stack || error);
    } finally {
        // Destroy the data source to release connections
        try {
            await dataSource.destroy();
            logger.log('Data source destroyed successfully.');
        } catch (destroyError) {
            logger.error('Error during data source cleanup:', destroyError.stack || destroyError);
        }
    }
}

runSeeds();
