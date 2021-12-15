import { Get, Inject, Injectable, Param, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateMessageDto } from './dto/message.dto';
import { FilterMessageDto } from './dto/message_param.dto';
import { MessageDocument, Message } from './scheme/message.schema';
import * as bcrypt from 'bcrypt';
import { AllMsgFrI } from './interFace/msgListFr';
@Injectable()
export class MessageService {
    constructor( @Inject("MESSAGE_MODEL")  private messageModel:Model<MessageDocument>){}
    //..........
    findAllMessage(): Promise<Message[]> {
        return this.messageModel.find().exec();
    }
    // tạo tin nhắn mới từ dữ liệu post lên và lưu vào data
    async create(data:CreateMessageDto){
       try{ let newMessage=new this.messageModel({
                      ...data,
                      
                    })
            await  newMessage.save()
            return "done"
        }catch(err){return "error"}

        
    }   
    //
    async findLimit(limit:number,offset:number,sourceId:string,targetId:string):Promise<Message[]>{
        try{ 
            return this.messageModel.find({"sourceId":sourceId, "targetId":targetId}).skip(offset).limit(limit).sort({time:-1}).exec();
        }catch (e) {return []}    
    }   
    // 
    
       
    async findAllMessageFr(limit:number,offset:number,sourceId:string,hadMessageList:string[]):Promise<AllMsgFrI>{
        try{
            let data={}
            for (let i = 0; i < hadMessageList.length;i++){
                let result =await Promise.all([this.findLimit(limit,offset,sourceId,hadMessageList[i]),
                                        this.findLimit(limit,offset,hadMessageList[i],sourceId)]) ;
                let  newListMsg :Message[] =[]
                newListMsg=result[0].concat(result[1])
                // newListMsg.sort((msg1,msgw2)=> msg1.time > msgw2.time)
                data[sourceId+"/"+hadMessageList[i]]= newListMsg
            }
            return data
        }catch (e) {return {}}
    }
}
