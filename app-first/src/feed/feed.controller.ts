import { Delete, Get, Param, Put, Query, Req, Res, Session, UsePipes, ValidationPipe } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { Request, Response } from 'express';
import { BaseFeedDto, CreateFeedDto } from './dto/feed.dto';
import { FilterFeedDto } from './dto/param_feed';
import { Server,Socket  } from 'socket.io';

import { FeedService } from './feed.service';
import { User } from '../user/scheme/user.schema';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { EventsGateway } from '../events/event,gateway';
import { UserService } from '../user/user.service';
import { BaseCommentDto } from './dto/comment';


@Controller('feed')
export class FeedController {
   
    constructor(
        private eventsGateway:EventsGateway,
        private feedService: FeedService,
        private userService: UserService
    ){}

    //----------------------------like tym-----------------------------------------
    @Post("likeFeed")
    async likeFeed(@Body() data:{feedId:string,event:string}, @Res() res: Response,@Req() req: Request){
        console.log(data)
        var result = await this.feedService.likeFeed(req.user["_id"].toString(),data.feedId,data.event)
        if(result=="error"){res.json("error")}
        else{
            await this.eventsGateway.likeFeed(data.event,result)
            res.json(result)
        }
    }  
    //------------------------------- Comment------------------------------------------
    @Post(":feedId/comment")
    async createComment(@Body()   baseCommentDto :BaseCommentDto,@Param() params,
     @Req() req :Request,@Res() res :Response,
    ) { 
        try {
            console.log("----running create comment-------------")
            console.log(baseCommentDto.sourceUserId)
            console.log(params.feedId)
            const result = await this.feedService.createComment(params.feedId,baseCommentDto)
            return res.json(result)
            
            
        }catch(e){ res.json("error")}
        
    }
    //---------------create bài-------------------------------------------------------- 
    @Post("")
    async create(@Body()   createFeedDto :CreateFeedDto, @Req() req :Request,@Res() res :Response,
    @Session() session: Record<string, any>) { 
        try {
            console.log("----chajyy create feed-------------")
            console.log(createFeedDto.sourceUserId)
            console.log(req.user["_id"].toString())
            if(createFeedDto.sourceUserId==req.user["_id"].toString()){
                console.log("--id source bằng nhau-------------")
                const ownId=createFeedDto.sourceUserId
                const userOwn= await this.userService.findOne(createFeedDto.sourceUserName)
                console.log(createFeedDto)
                const result= await this.feedService.create(createFeedDto);
                if(result!="error"&&result!=undefined){
                   
                    console.log("gửi đến tất cả bạn bè này")
                    console.log(req.user["friend"])
                    this.eventsGateway.createNewFeed({feedId:result,...createFeedDto},req.user["friend"])
                    res.json(result)
                }
                else{ res.json("error")}
            }
            else{ res.json("error")}
            
        }catch(e){ res.json("error")}
        
    }
    @Get(":feedId/comment")
    async getComment(@Param() params,
     @Req() req :Request,@Res() res :Response,
    ) { 
        try {
            console.log("----running getcomment-------------")
            console.log(params.feedId)
            const result = await this.feedService.getComment(params.feedId)
            return res.json(result) 
        }catch(e){ res.json("error")}
        
    }
    
    @Get("limitFeedOwn")
    @UsePipes(new ValidationPipe({ transform: true }))
    async getFeedLimit(@Query() filerFeedDto: FilterFeedDto,@Res() res: Response,@Req() req: Request){
        console.log("limitFeedOwn")
        console.log(req.user["_id"].toString())
        const {limit,offset,startedAt,endedAt,sourceId}=filerFeedDto;
        var a = await this.feedService.findLimit(limit,offset,sourceId)
        console.log("kết quả của feed limit l à ")
        console.log(a)
        return res.json(a);
    }
    //----------------------------get feed -----------
    @Get("/:sourceFeedId")
    async getFeed(@Param() params,@Res() res: Response){
        console.log("--find one -feed- ")
        console.log(params.sourceFeedId)
        const result =await this.feedService.findOneById(params.sourceFeedId)
        return res.json(result)
    }
    
    @Put(":feedId/comment")
    async updateComment(@Param() params,@Body() data : {baseCommentDto :BaseCommentDto,newMessage:string,newPathImg:string},
     @Req() req :Request,@Res() res :Response,
    ) { 
        console.log("update-----------comment")
        try {
            console.log(data.baseCommentDto)
            console.log(params.feedId)
            const result = await this.feedService.updateComment(params.feedId,data.baseCommentDto,data.newMessage,data.newPathImg)
            return res.json(result) 
        }catch(e){ res.json("error")}
        
    }
    @Delete(":feedId/comment") 
    async deleteComment(@Param() params,@Body() baseCommentDto :BaseCommentDto,
     @Req() req :Request,@Res() res :Response,
    ) { 
        try {
            console.log(baseCommentDto)
            console.log(params.feedId)
            let result = await this.feedService.deleteComment(params.feedId,baseCommentDto);
            console.log("kết quả trả về khi delete");
            console.log(result)
            return res.json(result) ;
           
        }catch(e){ res.json("error")}
        
    }
}
