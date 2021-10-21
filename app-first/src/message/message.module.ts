import { Module } from '@nestjs/common';

import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { DatabaseModule } from '../database/database.module';
import { messageProviders } from './message.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './scheme/message.schema';

@Module({
  imports: [DatabaseModule,MongooseModule.forFeature([{name:Message.name,schema:MessageSchema}])],
  controllers: [MessageController],
  providers: [MessageService,...messageProviders],
  exports:[MessageService]
})
export class MessageModule {}
