import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { CreateMessageDto } from './dto/message.dto';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}
   
    @Get()
    async findAll() {
        return await this.messageService.findAllMessage();
    }
    @Post("")
    async create(@Body()   createMessageDto :CreateMessageDto, @Req() req){
        console.log(createMessageDto)
        return await this.messageService.create(createMessageDto);
    }

}
