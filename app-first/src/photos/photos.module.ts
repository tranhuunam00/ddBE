import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { MessageModule } from '../message/message.module';
import { MessageService } from '../message/message.service';
import { DatabaseModule } from '../database/database.module';

@Module({

  imports: [MessageModule,DatabaseModule],
  controllers: [PhotosController],
  providers: []
})
export class PhotosModule {}
