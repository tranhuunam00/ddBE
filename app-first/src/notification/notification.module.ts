import { Module } from '@nestjs/common';
import { NotifisProviders } from './notifi.providers';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService,...NotifisProviders]
})
export class NotificationModule {}
