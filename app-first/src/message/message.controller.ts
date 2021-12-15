import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { CreateMessageDto } from './dto/message.dto';
import { FilterMessageDto } from './dto/message_param.dto';
import { MessageService } from './message.service';
import { Message } from './scheme/message.schema';
import { AllMsgFrI } from './interFace/msgListFr';
import { UserService } from '../user/user.service';
import { EventsGateway } from '../events/event,gateway';

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService,
        private eventsGateway:EventsGateway,

        private userService:UserService) {}
   
    @Get()
    async findAll() :Promise<Message[]>{
        return await this.messageService.findAllMessage();
    }

    @Post("")
    async create(@Body()   createMessageDto :CreateMessageDto, @Req() req,@Res() res){
        console.log(createMessageDto)
        const result= await Promise.all([this.messageService.create(createMessageDto),
        this.eventsGateway.emitClientMessage(createMessageDto)]) 
        return res.json(result[0])
    }


    @Get("/individual") 
    @UsePipes(new ValidationPipe({ transform: true }))
    async findLimit( @Query() filerMessageDto: FilterMessageDto):Promise<Message[]>{
       const {limit,offset,startedAt,endedAt,sourceId,targetId}=filerMessageDto;
       console.log(limit)
        console.log(typeof sourceId)
       var data= await this.messageService.findLimit(limit,offset,sourceId,targetId);
       return data.reverse();
       console.log(data.reverse());
    }
    
    @Get("/allMsgFR") 
    @UsePipes(new ValidationPipe({ transform: true }))

    async findAllMessage( @Query() data: {limit:number, offset:number},@Req() req: Request):Promise<AllMsgFrI>{
       let {limit,offset}=data;
       if(limit==undefined){limit=30}
       if(offset==undefined){offset=0}
       const sourceId=req.user["_id"];
       const hadMessageList =req.user["hadMessageList"];
       console.log(hadMessageList)
       var result= await this.messageService.findAllMessageFr(limit,offset,sourceId,hadMessageList);
       return result;
      
    }

    @Get(":roomId/messages")
    @UsePipes(new ValidationPipe({ transform: true }))
    async findMessages(
        @Param("roomId", ParseIntPipe) roomId: number,
        @Query() filerMessageDto: FilterMessageDto
    ): Promise<Message[]> {
        return []
    }
}
