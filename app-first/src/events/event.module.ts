import { Module } from "@nestjs/common";
import { EventsGateway } from "./event,gateway";
import { DatabaseModule } from '../database/database.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports:[DatabaseModule,MessageModule],
    providers: [EventsGateway]
  })
export class EventsModule {}