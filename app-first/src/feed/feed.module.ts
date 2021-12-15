import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedController} from './feed.controller';
import { FeedsProviders } from './feed.providers';
import { FeedService } from './feed.service';
import { UserSchema } from '../user/scheme/user.schema';
import { Feed } from './scheme/feed.schema';
import { DatabaseModule } from '../database/database.module';
import { JwtMiddleware } from '../core/middleware/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { EventsModule } from '../events/event.module';
import { EventsGateway } from '../events/event,gateway';
import { MessageModule } from '../message/message.module';
@Module({
  imports: [DatabaseModule,MongooseModule.forFeature([{name:Feed.name,schema:UserSchema}]),
  UserModule,
  MessageModule,
  JwtModule.register({
    secret: "secretKey",
    signOptions: { expiresIn: '1000s' },
  }),],
  controllers: [FeedController],
  providers: [FeedService,...FeedsProviders,EventsGateway],
  exports : [FeedService]
})
export class FeedModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(FeedController);
  }
}
