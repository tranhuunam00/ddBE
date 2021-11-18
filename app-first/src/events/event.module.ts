import { Global,  MiddlewareConsumer,  Module } from "@nestjs/common";
import { EventsGateway } from "./event,gateway";
import { DatabaseModule } from '../database/database.module';
import { MessageModule } from '../message/message.module';
import { JwtMiddleware } from '../core/middleware/jwt.middleware';
import { JwtModule } from "@nestjs/jwt";
import { UserModule } from '../user/user.module';


@Global()
@Module({
  imports:[UserModule,
    DatabaseModule,MessageModule,
    JwtModule.register({
    secret: "secretKey",
    signOptions: { expiresIn: '500s' },
    }),
    ],
    providers: [EventsGateway],
    exports: [EventsGateway]
  })
export class EventsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply(JwtMiddleware)
    .exclude(
      // { path: 'cats', method: RequestMethod.GET },
      // { path: 'cats', method: RequestMethod.POST },
      // 'cats/(.*)',
    )
    .forRoutes(EventsGateway);
  }
}