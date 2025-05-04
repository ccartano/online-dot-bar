import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const hashedToken = request.headers['x-admin-token'];
    const adminToken = this.configService.get<string>('ADMIN_TOKEN');
    
    if (!adminToken) {
      this.logger.error('ADMIN_TOKEN not configured in environment');
      throw new UnauthorizedException('Admin access not configured');
    }

    const expectedHashedToken = createHash('sha256').update(adminToken).digest('hex');

    if (!hashedToken) {
      this.logger.warn('No admin token provided in request');
      throw new UnauthorizedException('Admin access required');
    }

    if (hashedToken !== expectedHashedToken) {
      this.logger.warn('Token hash mismatch');
      throw new UnauthorizedException('Invalid admin token');
    }

    return true;
  }
} 