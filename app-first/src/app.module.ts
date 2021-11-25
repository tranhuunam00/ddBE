import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './core/middleware/logger.middleware';
import { EventsModule } from './events/event.module';
import { UserSql } from './user/entities/user.entity';
import { UserController } from './user/user.controller';
import {UserModule} from './user/user.module'
import { PhotosModule } from './photos/photos.module';
import { MessageModule } from './message/message.module';
import { ConfigModule } from '@nestjs/config';
import { FeedModule } from './feed/feed.module';
import { MailModule } from './mail/mail.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';



@Module({
  imports: [UserModule,PhotosModule,
    TypeOrmModule.forRootAsync({
      useFactory: async () =>
        Object.assign(await getConnectionOptions(), {
          autoLoadEntities: true,
        }),
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false',{
    autoCreate:true,
  }),
    AuthModule,
    PhotosModule,
    MessageModule,
    FileModule,
    FeedModule,
    ConfigModule.forRoot({
      isGlobal: true, // no need to import into other modules
    }),
    MailModule,
    FileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(LoggerMiddleware)
    //   .forRoutes(UserController);
  }
}
