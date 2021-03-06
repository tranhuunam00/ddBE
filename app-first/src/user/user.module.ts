import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from '../database/database.module';
import {  User, UserSchema } from './scheme/user.schema';
import { UserController } from './user.controller';
import { usersProviders, tokenProviders } from './user.providers';
import { UserService } from './user.service';

import { UserSql } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { JwtMiddleware } from '../core/middleware/jwt.middleware';
import { EventsModule } from '../events/event.module';
import { MessageModule } from '../message/message.module';
import { EventsGateway } from '../events/event,gateway';
import { NotificationService } from '../notification/notification.service';
import { NotificationModule } from '../notification/notification.module';

@Global()
@Module({
  imports: [
    // TypeOrmModule.forFeature([UserSql]),DatabaseModule,
  MongooseModule.forFeature([{name:User.name,schema:UserSchema}]),
  JwtModule.register({
    secret: "secretKey",
    signOptions: { expiresIn: '1000s' },
  }),
  NotificationModule,
  MailModule
  ],
  controllers: [UserController],
  providers: [UserService,...usersProviders,...tokenProviders,EventsGateway],
  exports: [UserService]
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(UserController);
  }
  // constructor(private usersService: UserService) {}
}
