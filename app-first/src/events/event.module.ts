import { Global,  MiddlewareConsumer,  Module } from "@nestjs/common";
import { EventsGateway } from "./event,gateway";
import { DatabaseModule } from '../database/database.module';
import { MessageModule } from '../message/message.module';
import { JwtMiddleware } from '../core/middleware/jwt.middleware';
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from '../user/user.module';


@Global()
@Module({
  imports:[
    DatabaseModule,MessageModule,
    
    ],
    providers: [EventsGateway],
    exports: [EventsGateway]
  })
export class EventsModule {
  
}