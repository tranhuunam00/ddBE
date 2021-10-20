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
  var clients={};


  @WebSocketGateway()
  export class EventsGateway {
    @WebSocketServer()
    server: Server;
    
    @SubscribeMessage('signin')
    signin(socket: Socket, id: number) {
      console.log(id)
      clients[id]=socket;
      // console.log(clients)
    }

    @SubscribeMessage('message')
    hello(@MessageBody() data: any) {
      console.log(data) 
      for(var i in clients) {
        console.log(i);
      }
      let targetId=parseInt( data.targetId);
      console.log(clients[targetId]!=null)
     if(clients[targetId]!=null){
       clients[targetId].emit("message",data);
    }
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