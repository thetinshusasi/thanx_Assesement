import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Logger } from 'nestjs-pino';
import { InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { UserRole } from '../users/models/enums/user-role.enum';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;
  let logger: Logger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    logger = module.get<Logger>(Logger);
  });

  describe('signup', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.CUSTOMER,
        name: ''
      };
      jest.spyOn(usersService, 'create').mockResolvedValue(undefined);

      const result = await authController.signup(createUserDto);

      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(logger.log).toHaveBeenCalledWith(
        `User registered successfully with email: ${createUserDto.email}`,
      );
      expect(result).toEqual({ message: 'User registered successfully' });
    });

    it('should throw an InternalServerErrorException when registration fails', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.CUSTOMER,
        name: ''
      };
      jest.spyOn(usersService, 'create').mockRejectedValue(new Error('Database error'));

      await expect(authController.signup(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(logger.error).toHaveBeenCalledWith(
        `Error during signup for email ${createUserDto.email}: Database error`,
        expect.any(String),
      );
    });
  });

  describe('login', () => {
    it('should log in a user successfully', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const user: User = { id: 1, email: credentials.email, role: UserRole.CUSTOMER, name: 'Test User', password: 'hashedPassword' };
      jest.spyOn(authService, 'validateUser').mockResolvedValue(user);
      jest.spyOn(authService, 'login').mockResolvedValue({ token: 'token' });

      const result = await authController.login(credentials);

      expect(authService.validateUser).toHaveBeenCalledWith(
        credentials.email,
        credentials.password,
      );
      expect(logger.log).toHaveBeenCalledWith(
        `User login successful for email: ${credentials.email}`,
      );
      expect(result).toEqual({ token: 'token' });
    }); it('should throw an UnauthorizedException for invalid credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      jest.spyOn(authService, 'validateUser').mockRejectedValue(new UnauthorizedException());

      await expect(authController.login(credentials)).rejects.toThrow(UnauthorizedException);
      expect(logger.warn).toHaveBeenCalledWith(
        `Unauthorized login attempt for email: ${credentials.email}`,
      );
    });

    it('should throw an InternalServerErrorException when login fails', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      jest.spyOn(authService, 'validateUser').mockRejectedValue(new Error('Database error'));

      await expect(authController.login(credentials)).rejects.toThrow(InternalServerErrorException);
      expect(logger.error).toHaveBeenCalledWith(
        `Error during login for email ${credentials.email}: Database error`,
        expect.any(String),
      );
    });
  });
});
