import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { UserRole } from '../models/enums/user-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'The name of the user',
        example: 'John Doe',
    })
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'The email address of the user',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'The password for the user account, must be at least 6 characters',
        example: 'password123',
        minLength: 6,
    })
    @MinLength(6)
    password: string;

    @ApiProperty({
        description: 'The role of the user',
        example: UserRole.CUSTOMER,
        enum: UserRole,
        required: false,
    })
    @IsEnum(UserRole)
    role?: UserRole;
}
