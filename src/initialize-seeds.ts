import dataSource from './ormconfig'; // Adjust the path if ormconfig is in a different directory
import { runSeeders } from 'typeorm-extension';

async function runSeeds() {
    try {
        // Initialize the data source
        await dataSource.initialize();
        await dataSource.synchronize(true);

        // Run seeders
        await runSeeders(dataSource);

        console.log('Seeding complete!');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        // Destroy the data source to release connections
        await dataSource.destroy();
    }
}

runSeeds();