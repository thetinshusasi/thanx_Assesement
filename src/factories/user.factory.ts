
import { setSeederFactory } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/models/enums/user-role.enum';
import { faker } from '@faker-js/faker';

export default setSeederFactory(User, () => {
    const user = new User();
    user.name = faker.name.fullName();
    user.email = faker.internet.email();
    user.password = bcrypt.hashSync('password123', 10); // Default password
    user.role = UserRole.CUSTOMER;
    return user;
});