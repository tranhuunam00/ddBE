import { Global,MiddlewareConsumer,Module } from '@nestjs/common';
import { NotifisProviders } from './notifi.providers';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EventsGateway } from '../events/event,gateway';
import { MessageModule } from '../message/message.module';
import { JwtMiddleware } from '../core/middleware/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
@Global()
@Module({
  imports: [JwtModule.register({
    secret: "secretKey",
    signOptions: { expiresIn: '1000s' },
  }),
 ],
  controllers: [NotificationController],
  providers: [NotificationService,...NotifisProviders,EventsGateway],
  exports:[NotificationService]
})
export class NotificationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(NotificationController);
  }
}
