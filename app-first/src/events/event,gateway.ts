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
import { BaseNotifiDto } from '../notification/dto/notifi_dto';
  //
  var clients={};
  @WebSocketGateway()
  export class EventsGateway {

    constructor(){}

    @WebSocketServer()
    server: Server;
    
    @SubscribeMessage('signin')
    signin( @MessageBody() id:string ,@ConnectedSocket() socket: Socket,@Session() session: Record<string, any>
    ) {
      console.log("----------run signin socket-------------------")
      console.log(id)
      clients[id]=socket;
      
    }

    

    
    //------------------------create feed --------------
    @SubscribeMessage('postFeedServer')
      async CreateFeed(@MessageBody() data: any) {
        console.log(data)
    }
    //----------------------like feed------------------
    async likeFeed(dataFeed:
      {feedUserId:string,createdAt:string, feedId:string,realNameLiked:string ,
        type:string, avatarLiked:string,idUserLiked}) {
        if(dataFeed.feedUserId in clients){
          clients[dataFeed.feedUserId].emit("likeFeed",dataFeed)
        }
    }
    //
    
    //---------------gửi tin nhắn ----------------------------------------------------------------
    async emitClientMessage (data){
      if(clients[data.targetId]!=null){
        console.log("có người dùng onl này nhé")
        clients[data.targetId].emit("message",data);
      }
    }
    // gửi lời mời kết bạn async
    async handleFr(data :BaseNotifiDto, targetId){
      if(targetId in clients){
        if(clients[targetId]!=null){
          clients[targetId].emit("handleFr",data)
        }
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
              clients[listFr[i]].emit("newFeed",data)}
        }
      }
      async createNewTag ( data: any,listTag: string[]) {
        console.log(data);
        for(let i=0;i<listTag.length;i++){
          if(listTag[i] in clients){
              console.log(listTag[i]);
              console.log("--da emit-------")
              clients[listTag[i]].emit("newTag",data)}
        }
      }
    @SubscribeMessage('identity')
    async identity(@MessageBody() data: number): Promise<number> {
      return data;
    }
  }