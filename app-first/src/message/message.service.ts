import { Get, Inject, Injectable, Param, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMessageDto, CreateMessageDto } from './dto/message.dto';
import { FilterMessageDto } from './dto/message_param.dto';
import { MessageDocument, Message } from './scheme/message.schema';
import * as bcrypt from 'bcrypt';
import { AllMsgFrI } from './interFace/msgListFr';
import { UserService } from '../user/user.service';
import { NotificationService } from '../notification/notification.service';
@Injectable()
export class MessageService {
    constructor(
        
        @Inject("MESSAGE_MODEL")  private messageModel:Model<MessageDocument>,

        private userService: UserService,
        private notifiService:NotificationService
    ){}
    //..........
    async findAllMessage(): Promise<Message[]> {
        var result =await this.messageModel.find().exec();
        console.log(result);
        return result
    }
    async findOne(msg :BaseMessageDto) :Promise<Message>{

        return await this.messageModel.findOne({message:msg.message,time:msg.time}).exec();
    }
    // tạo tin nhắn mới từ dữ liệu post lên và lưu vào data
    async create(data:CreateMessageDto){
       try{ let newMessage=new this.messageModel({
                      ...data,
                      delete:[]
                    })
            await  newMessage.save()
            await this.notifiService.createNotifiMsg({
                type:"newMsg",sourceUserId:data.sourceId,targetUserId:[data.targetId],content:data.sourceId,
                createdAt:data.time})
            return "done"
        }catch(err){return "error"}

        
    }   
    //
    async findLimit(limit:number,offset:number,sourceId:string,targetId:string,idDelete:string):Promise<Message[]>{
        try{ 
            const li:number = parseInt(limit.toString(),10)
            const offs:number=parseInt(offset.toString(),10)
            return this.messageModel.find({"sourceId":sourceId, "targetId":targetId ,delete:{$not:{$in:[idDelete]}}}).skip(offs).limit(li).sort({time:-1}).exec();
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
                listApi.push(this.findLimit(li,offs,sourceId,id,sourceId.toString()))
                listApi.push(this.findLimit(li,offsTarget,id,sourceId,sourceId.toString()))
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
    //------------------------delete all-------------------------------
    async deleteAll(sourceId:string,targetId: string,){
        try{
            
            await Promise.all([
                this.messageModel.updateMany({targetId:targetId,sourceId:sourceId},{$addToSet: {delete: sourceId}}),
                this.messageModel.updateMany({targetId:sourceId,sourceId:targetId},{$addToSet: {delete: sourceId}}),
                this.userService.deleteHadUserChat(targetId,sourceId)
                 // this.messageModel.updateMany({targetId:targetId,sourceId:sourceId}, {delete: []}),
            ]);

            return "done"
        }catch (e) {return "error"}
    }
    async deleteOne(msg :BaseMessageDto,userId:string){
        try{
            if(userId==msg.targetId||userId==msg.sourceId){

                let update = await 
                this.messageModel.findOneAndUpdate(
                    {targetId:msg.targetId,sourceId:msg.sourceId,message:msg.message,time:msg.time},
                    {$addToSet: {delete: userId}})
                // this.messageModel.updateMany({targetId:targetId,sourceId:sourceId}, {delete: []}),

                console.log("kết quả sau khi update là")
                console.log(update)
                if(update!=null){

                    let result = await Promise.all([
                        this.messageModel.findOne({targetId:msg.targetId,sourceId:msg.sourceId,delete:{$not:{$in:[userId]}}}),
                        this.messageModel.findOne({targetId:msg.sourceId,sourceId:msg.targetId,delete:{$not:{$in:[userId]}}})
                        
                    ])
                    console.log("kết quả tìm được ")
                    console.log(result)
                    if(result[0]==null && result[1] == null){
                        console.log("hết tin nhắn rồi ");
                        let resultUser
                        if(userId==msg.targetId){
                            resultUser= await Promise.all([
                                    this.userService.deleteHadUserChat(msg.sourceId,msg.targetId)
                            ])
                        }else{
                            resultUser= await Promise.all([
                                this.userService.deleteHadUserChat(msg.targetId,msg.sourceId)
                            
                            ])
                        }
                    
                        if(resultUser[0]=="done"){
                            return "0"
                        }else{return "error"}
                    }
                    return "done" 
                }else{return "error"}
                
                 
                
                return "done"
            }else{return "error"}
            
          
        }catch (e) {return "error"}
    }
    
}
