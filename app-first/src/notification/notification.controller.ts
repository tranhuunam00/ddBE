import { Controller, Param, Post, Req, Res, Body, Get, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { async } from 'rxjs';
import { BaseNotifiDto } from './dto/notifi_dto';
import { NotificationService } from './notification.service';
import { Notifi } from './scheme/Notifi.schema';
import { EventsGateway } from '../events/event,gateway';
import { FilterNotifiDto } from './dto/notifi_param.dto';

@Controller('notification')
export class NotificationController {
    constructor( private notifiSevice:NotificationService,
        private eventsGateway:EventsGateway,
        
        ){}
    @Get("findLimit")
    async findLimit(@Query() filerNotifiDto: FilterNotifiDto,@Res() res){
        const {limit,offset,startedAt,endedAt,sourceUserId,targetUserId}=filerNotifiDto;
        console.log(limit)
        var data= await this.notifiSevice.findLimit(limit,offset,targetUserId);
        return res.json(data.reverse());
        console.log(data.reverse());
    }
    @Get("findLimitNotTargetId")
    async findLimitNotTargetId(@Query() filerNotifiDto: FilterNotifiDto,@Req() req,@Res() res){
        const {limit,offset,startedAt,endedAt,sourceUserId,targetUserId}=filerNotifiDto;
        console.log(limit)
        
        var data= await this.notifiSevice.findLimitNotTargetId(limit,offset,req.user["friend"],);
        return res.json(data)
     
    }
    ///////////////////////////////////tạo thông bao moi----------------
    @Post("")
    async Create(@Body() data:BaseNotifiDto, @Res() res: Response,@Req() req: Request){
        let result = await this.notifiSevice.create(data);
        res.json(result);
        //trả về id mới tạo hoặc là error
    }  
}
