import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/message.dto';
import { MessageDocument, Message } from './scheme/message.schema';

@Injectable()
export class MessageService {
    constructor( @Inject("MESSAGE_MODEL")  private messageModel:Model<MessageDocument>){}
    //..........
    findAllMessage(): Promise<Message[]> {
        return this.messageModel.find().exec();
    }
    //
    async create(data:CreateMessageDto){
        let newMessage=new this.messageModel({
                      ...data,
                    })
        return await  newMessage.save()
    }      
}
