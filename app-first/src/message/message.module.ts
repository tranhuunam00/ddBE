import { Global, MiddlewareConsumer, Module } from '@nestjs/common';

import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { DatabaseModule } from '../database/database.module';
import { messageProviders } from './message.provider';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './scheme/message.schema';
import { JwtMiddleware } from '../core/middleware/jwt.middleware';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { EventsGateway } from '../events/event,gateway';
@Global()
@Module({
  imports: [DatabaseModule,MongooseModule.forFeatureAsync([{name:Message.name,
    useFactory: () => {
    const schema = MessageSchema;
    schema.pre('updateOne', function() {
      // this.set({ updatedAt: new Date() });  
    });
    schema.post('find', function(res,next){
      console.log("chạy qua cái này 1")
      console.log(res)
      next()
    });
    // schema.post('find', function(result) {
    //   console.log("chậy qua cái này")
    //   for(let i = 0; i <result.length; i++) {
    //     if(result[i]["delete"].length==0){
    //       result.splice(i, 1);
    //     }
    //     i--
    //   }
      
    // });
      // schema.post('find', function(error, res, next) {
      //   console.log(res)
      //   console.log("cho đi qua")
      //   if (error.name === 'MongoServerError' && error.code === 11000) {
      //     next(new Error('There was a duplicate key error'));
      //   } else {
      //     next(); // The `update()` call will still error out.
      //   }
      // });
    schema.plugin(function (schema,model) {},{ overrideMethods: 'all' })
    return schema;
  },}]),
  UserModule,
  JwtModule.register({
    secret: "secretKey",
    signOptions: { expiresIn: '500s' },
  }),
  
  ],
  controllers: [MessageController],
  providers: [MessageService,...messageProviders,EventsGateway],
  exports:[MessageService]
})
export class MessageModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(MessageController);
  }
}
