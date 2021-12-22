import { Body, Controller, Delete,  Get, Param, ParseIntPipe, Post, Query, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { CreateMessageDto, BaseMessageDto } from './dto/message.dto';
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
   
    @Get("test")
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
    async findLimit( @Query() filerMessageDto: FilterMessageDto,@Req() req):Promise<Message[]>{
       const {limit,offset,startedAt,endedAt,sourceId,targetId}=filerMessageDto;
       console.log(limit)
        console.log(typeof sourceId)
       var data= await this.messageService.findLimit(limit,offset,sourceId,targetId,req.user["_id"].toString());
       return data.reverse();
  
    }
    //...........................................
    // @Get("/limit")
    // async findLimit( @Query() data: {limit:number, offset:number},@Req() req: Request){

    // }
    @Get("/msgLimit") 
    @UsePipes(new ValidationPipe({ transform: true }))

    async findLimitMessage( @Query() data: {limit:number, offsetUser:number,targetId:string,offsetTarget:number},@Req() req: Request):Promise<AllMsgFrI>{
       let {limit,offsetUser,offsetTarget,targetId}=data;
       if(limit==undefined){limit=30}
       if(offsetUser==undefined){offsetUser=0}
       console.log(limit,offsetUser)
       const sourceId=req.user["_id"];
       
        limit=limit.valueOf()
        offsetUser=offsetUser.valueOf()
       var result= await this.messageService.findAllMessageFr(limit,offsetUser,sourceId,[targetId],offsetTarget);
       return result;
      
    }


    //------------
    @Get("/allMsgFR") 
    @UsePipes(new ValidationPipe({ transform: true }))

    async findAllMessage( @Query() data: {limit:number, offset:number},@Req() req: Request):Promise<AllMsgFrI>{
       let {limit,offset}=data;

       if(limit==undefined){limit=30}

       if(offset==undefined){offset=0}

       console.log(limit,offset)

       const sourceId=req.user["_id"];
       
       const hadMessageList =req.user["hadMessageList"];
        limit=limit.valueOf()
        offset=offset.valueOf()
       var result= await this.messageService.findAllMessageFr(limit,offset,sourceId,hadMessageList,-1);
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

    @Delete("/individual")
    async deleteOne(@Res() res,@Req() req,@Param() params,@Body() body : BaseMessageDto){
        
        let result = await this.messageService.deleteOne(body,req.user["_id"].toString());
        res.json(result);
    }
    
    @Delete("/:targetId")
    async deleteAll(@Res() res,@Req() req,@Param() params){
        let result = await this.messageService.deleteAll(req.user["_id"].toString(),params.targetId);
        res.json(result);
    }
}
