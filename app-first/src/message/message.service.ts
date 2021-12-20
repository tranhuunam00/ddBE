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
    async findAllMessage(): Promise<Message[]> {
        var result =await this.messageModel.find().exec();
        console.log(result);
        return result
    }
    // tạo tin nhắn mới từ dữ liệu post lên và lưu vào data
    async create(data:CreateMessageDto){
       try{ let newMessage=new this.messageModel({
                      ...data,
                      delete:[]
                    })
            await  newMessage.save()
            return "done"
        }catch(err){return "error"}

        
    }   
    //
    async findLimit(limit:number,offset:number,sourceId:string,targetId:string):Promise<Message[]>{
        try{ 
            const li:number = parseInt(limit.toString(),10)
            const offs:number=parseInt(offset.toString(),10)
            return this.messageModel.find({"sourceId":sourceId, "targetId":targetId}).skip(offs).limit(li).sort({time:-1}).exec();
        }catch (e) {return []}    
    }   
    // 
    
       
    async findAllMessageFr(limit:number,offset:number,sourceId:string,hadMessageList:string[],offsetTarget:number):Promise<AllMsgFrI>{
        try{
            let data={}
            let offsTarget = parseInt(offsetTarget.toString(),10)
            
            const li:number = parseInt(limit.toString(),10)
            const offs:number=parseInt(offset.toString(),10)
            if(offsTarget==-1){
                offsTarget=offs
            }
            const z:number=0
            let listApi =[]
            console.log(limit,offset)
            console.log(typeof li)
            
            hadMessageList.map(id=>{
                listApi.push(this.findLimit(li,offs,sourceId,id))
                listApi.push(this.findLimit(li,offsTarget,id,sourceId))
            })
            let result = await Promise.all(listApi)
            for (let i = 0; i < hadMessageList.length;i++){
                let  newListMsg :Message[] =[]
                if(result[i*2].length>0&&result[i*2+1].length>0){

                    const min0=result[i*2][result[i*2].length-1]
                    const min1=result[i*2+1][result[i*2+1].length-1]
                    const maxTime=min0.time>min1.time?min0.time:min1.time

                    newListMsg=result[i*2].concat(result[i*2+1])
                    for(let j=0;j<newListMsg.length;j++){
                        if(newListMsg[j].time<maxTime){
                            newListMsg.splice(j, 1)
                            j--
                        }
                    }
                    data[sourceId+"/"+hadMessageList[i]]= newListMsg
                }else{
                    newListMsg=result[i*2].concat(result[i*2+1])
                    data[sourceId+"/"+hadMessageList[i]]= newListMsg
                }
                
            }
           
            return data
        }catch (e) {return {}}
    }
    //
    
}
