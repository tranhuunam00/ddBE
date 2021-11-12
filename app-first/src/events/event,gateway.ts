import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
  } from '@nestjs/websockets';
  import { from, Observable } from 'rxjs';
  import { map } from 'rxjs/operators';
  import { Server,Socket  } from 'socket.io';
  import { MessageService } from '../message/message.service';
  import { CreateMessageDto } from '../message/dto/message.dto';
import { Session } from '@nestjs/common';
  var clients={};


  @WebSocketGateway()
  export class EventsGateway {

    constructor(private messageService : MessageService){}


    @WebSocketServer()
    server: Server;
    
    @SubscribeMessage('signin')
    signin( @MessageBody() id:string ,socket: Socket,@Session() session: Record<string, any>
    ) {
      console.log(id)
      // clients[userName]=socket;
      clients[id]=socket;
      session.clients=clients;
      // console.log(clients)
    }

    @SubscribeMessage('message')
      async CreateMessage(@MessageBody() data: any) {
        console.log(data)
        console.log(data.message)
        console.log("all server..............................online..............")
        for(var i in clients) {
          console.log(i);
        }
        if(clients[data.targetId]!=null){
          clients[data.targetId].emit("message",data);
        }
        this.messageService.create({...data})
     }
     @SubscribeMessage('postFeed')
      async CreatePost(@MessageBody() data: any) {
        console.log(data)
        console.log(data.message)
        console.log("all server..............................online..............")
        for(var i in clients) {
          console.log(i);
        }
        if(clients[data.targetId]!=null){
          clients[data.targetId].emit("message",data);
        }
        this.messageService.create({...data})
     }
     
     @SubscribeMessage('test')
      test(@MessageBody() data: any) {
      
       this.server.emit('test'," test ");
 
     
      }

    @SubscribeMessage('identity')
    async identity(@MessageBody() data: number): Promise<number> {
      return data;
    }
  }