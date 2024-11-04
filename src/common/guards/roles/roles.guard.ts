import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../users/models/enums/user-role.enum';
import { Logger } from 'nestjs-pino';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly logger: Logger,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.get<UserRole[]>(
        'roles',
        context.getHandler(),
      );

      if (!requiredRoles) {
        this.logger.log('No roles specified, access granted by default');
        return true;
      }

      const { user } = context.switchToHttp().getRequest();

      if (!user) {
        this.logger.warn('Unauthorized access attempt - no user found in request');
        throw new ForbiddenException('Access denied');
      }

      const hasRole = requiredRoles.includes(user.role);
      if (!hasRole) {
        this.logger.warn(
          `Access denied for user ID: ${user.id}, role: ${user.role}. Required roles: ${requiredRoles.join(', ')}`,
        );
        throw new ForbiddenException('Access denied');
      }

      this.logger.log(`Access granted for user ID: ${user.id}, role: ${user.role}`);
      return true;
    } catch (error) {
      this.logger.error(`Authorization error: ${error.message}`, error.stack);
      throw error instanceof ForbiddenException
        ? error
        : new ForbiddenException('An error occurred during authorization');
    }
  }
}
