import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UsersService } from '../users.service';

@Injectable()
export class UnverifiedUserCleanupService {
  constructor(private readonly usersService: UsersService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleCleanup() {
    Logger.log('Suppression des comptes non vérifiés');
    await this.usersService.removeUnverifiedUsers();
  }
}