import { Module } from '@nestjs/common';
import { NotificationsResolver } from './notifications.resolver.js';
import { NotificationsService } from './notifications.service.js';
@Module({ providers: [NotificationsResolver, NotificationsService] })
export class NotificationsModule {}
