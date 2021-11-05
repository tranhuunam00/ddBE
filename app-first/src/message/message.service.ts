import { Get, Inject, Injectable, Param, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/message.dto';
import { FilterMessageDto } from './dto/message_param.dto';
import { MessageDocument, Message } from './scheme/message.schema';
import * as bcrypt from 'bcrypt';
@Injectable()
export class MessageService {
    constructor( @Inject("MESSAGE_MODEL")  private messageModel:Model<MessageDocument>){}
    //..........
    findAllMessage(): Promise<Message[]> {
        return this.messageModel.find().exec();
    }
    // tạo tin nhắn mới từ dữ liệu post lên và lưu vào data
    async create(data:CreateMessageDto){
       
        let newMessage=new this.messageModel({
                      ...data,
                      
                    })
        return await  newMessage.save()
    }   
    //
    async findLimit(limit:number,offset:number,sourceId:string,targetId:string):Promise<Message[]>{
         let a=await this.messageModel.collection.count() 
        return this.messageModel.find({"sourceId":sourceId, "targetId":targetId}).skip(offset).limit(limit).sort({time:-1}).exec();
    }   
    // 
   
}
