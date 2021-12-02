import { MiddlewareConsumer, Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { MessageModule } from '../message/message.module';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { JwtMiddleware } from '../core/middleware/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import { FeedModule } from '../feed/feed.module';

@Module({
  imports: [MessageModule,
    FeedModule,
    DatabaseModule,UserModule,JwtModule.register({
    secret: "secretKey",
    signOptions: { expiresIn: '500s' },
  }),],
  controllers: [FileController],
  providers: [FileService]
})
export class FileModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(FileController);
  }
}
