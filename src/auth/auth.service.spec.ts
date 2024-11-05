import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Logger } from 'nestjs-pino';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/models/enums/user-role.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;
  let configService: Partial<ConfigService>;
  let logger: Partial<Logger>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    configService = {
      get: jest.fn(),
    };

    logger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
        { provide: Logger, useValue: logger },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user is not found', async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(authService.validateUser('test@example.com', 'password'))
        .rejects
        .toThrow(UnauthorizedException);

      expect(logger.warn).toHaveBeenCalledWith(
        'Failed login attempt: User with email test@example.com not found',
      );
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const user = { email: 'test@example.com', password: 'hashedPassword' } as User;
      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.validateUser('test@example.com', 'wrongPassword'))
        .rejects
        .toThrow(UnauthorizedException);

      expect(logger.warn).toHaveBeenCalledWith(
        'Failed login attempt: Incorrect password for email test@example.com',
      );
    });
    it('should return the user if validation is successful', async () => {
      const user = { email: 'test@example.com', password: 'hashedPassword' } as User;
      (usersService.findByEmail as jest.Mock).mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.validateUser('test@example.com', 'password');

      expect(result).toBe(user);
      expect(logger.log).toHaveBeenCalledWith('User test@example.com successfully validated');
    });

    it('should throw InternalServerErrorException for unexpected errors', async () => {
      (usersService.findByEmail as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

      await expect(authService.validateUser('test@example.com', 'password'))
        .rejects
        .toThrow(InternalServerErrorException);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error during user validation for email test@example.com:'),
        expect.any(String),
      );
    });
  });

  describe('login', () => {
    it('should return a token if login is successful', async () => {
      const user = { id: 1, email: 'test@example.com', role: UserRole.CUSTOMER, name: 'Test User', password: 'password' } as User;
      (jwtService.sign as jest.Mock).mockReturnValue('testToken');
      (configService.get as jest.Mock).mockReturnValue('HS256');

      const result = await authService.login(user);

      expect(result).toEqual({ token: 'testToken' });
      expect(logger.log).toHaveBeenCalledWith('User test@example.com logged in successfully');
    }); it('should throw InternalServerErrorException for unexpected errors', async () => {
      const user = { id: 1, email: 'test@example.com', role: UserRole.CUSTOMER, name: 'Test User', password: 'password' } as User;
      (jwtService.sign as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await expect(authService.login(user))
        .rejects
        .toThrow(InternalServerErrorException);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error generating token for user test@example.com:'),
        expect.any(String),
      );
    });
  });
});
