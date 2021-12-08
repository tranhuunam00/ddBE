import { Controller, Param, Post, Req, Res, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { async } from 'rxjs';
import { BaseNotifiDto } from './dto/notifi_dto';
import { NotificationService } from './notification.service';
import { Notifi } from './scheme/Notifi.schema';

@Controller('notification')
export class NotificationController {
    constructor( private notifiSevice:NotificationService){}
   
    @Post("")
    async Create(@Body() data:BaseNotifiDto, @Res() res: Response,@Req() req: Request){
        let result = await this.notifiSevice.create(data);
        res.json(result);
        
    }  
}
