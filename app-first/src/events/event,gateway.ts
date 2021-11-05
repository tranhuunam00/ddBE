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
  var clients={};


  @WebSocketGateway()
  export class EventsGateway {

    constructor(private messageService : MessageService){}
    @WebSocketServer()
    server: Server;
    
    @SubscribeMessage('signin')
    signin(socket: Socket, id: number) {
      console.log(id)
      
      clients[id]=socket;
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
        // let targetId= data.targetId.toString();
        // let sourchId= data.sourchId.toString();
        // let message= data.message.toString(); ;
        // let path= data.path.toString(); 
        
        // let newMessage= {
        //   targetId: targetId,
        //   sourchId: sourchId,
        //   message: message,
        //   path: path,
        // }
        
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