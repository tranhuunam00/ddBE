import {
  ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server,Socket  } from 'socket.io';
  import { MessageService } from '../message/message.service';
  import { Session } from '@nestjs/common';
  //
  var clients={};
  @WebSocketGateway()
  export class EventsGateway {

    constructor(private messageService : MessageService){}

    @WebSocketServer()
    server: Server;
    
    @SubscribeMessage('signin')
    signin( @MessageBody() id:string ,@ConnectedSocket() socket: Socket,@Session() session: Record<string, any>
    ) {
      console.log("----------run signin socket-------------------")
      console.log(id)
      clients[id]=socket;
      
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
        await this.messageService.create({...data})
    }
    //------------------------create feed --------------
    @SubscribeMessage('postFeedServer')
      async CreateFeed(@MessageBody() data: any) {
        console.log(data)
    }
    //----------------------like feed------------------
    async likeFeed(data: any,feedUserId:string) {
        if(feedUserId in clients){
          clients[feedUserId].emit("likeFeed",data)
        }
    }

    /////----------------------comment---------------
    
    @SubscribeMessage('test')
      test(@MessageBody() data: any) {
        console.log(data);
       this.server.emit('test',data);
    }
    //--------------------------function create newfeed------------------
    async createNewFeed ( data: any,listFr: string[]) {
        console.log(data);
        for(let i=0;i<listFr.length;i++){
          if(listFr[i] in clients){
              console.log(listFr[i]);
              console.log("--da emit-------")
              clients[listFr[i]].emit("test",data)}
        }
      }
    @SubscribeMessage('identity')
    async identity(@MessageBody() data: number): Promise<number> {
      return data;
    }
  }