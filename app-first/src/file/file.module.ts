import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { MessageModule } from '../message/message.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [MessageModule,DatabaseModule],
  controllers: [FileController],
  providers: [FileService]
})
export class FileModule {}
