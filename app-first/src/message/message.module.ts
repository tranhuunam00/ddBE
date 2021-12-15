import { Global, MiddlewareConsumer, Module } from '@nestjs/common';

import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { DatabaseModule } from '../database/database.module';
import { messageProviders } from './message.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './scheme/message.schema';
import { JwtMiddleware } from '../core/middleware/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { EventsGateway } from '../events/event,gateway';
@Global()
@Module({
  imports: [DatabaseModule,MongooseModule.forFeature([{name:Message.name,schema:MessageSchema}]),
  UserModule,
  JwtModule.register({
    secret: "secretKey",
    signOptions: { expiresIn: '500s' },
  }),
  
  ],
  controllers: [MessageController],
  providers: [MessageService,...messageProviders,EventsGateway],
  exports:[MessageService]
})
export class MessageModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(MessageController);
  }
}
