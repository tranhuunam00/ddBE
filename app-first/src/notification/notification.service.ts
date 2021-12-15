import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseNotifiDto } from './dto/notifi_dto';
import { NotifiDocument } from './scheme/Notifi.schema';
import { Notifi } from './scheme/notifi.schema';



@Injectable()
export class NotificationService {
    constructor( @Inject("NOTIFI_MODEL")  private notifiModel:Model<NotifiDocument>,
    ){}
    //
    async create(data:BaseNotifiDto){
        try{
            let id :String;
            console.log("create")
             let newNotifi=await new this.notifiModel({
                      ...data,
                      isSeen:false,
                    })
            // console.log(newfeed.id);
            var a= await  newNotifi.save()
            .then((notifi) => {
                console.log(notifi.id);
                return notifi.id
            })
            .catch((err) => {return "error"})
            console.log(a)
            return a
    }catch(e){return "error"}
    }   
    //------------------------findLimit
    async findLimit(limit:number,offset:number,targetId:string):Promise<Notifi[]>{
        try{ 
            let result = await this.notifiModel.find({"targetUserId":targetId}).skip(offset).limit(limit).sort({time:-1}).exec();
            console.log(result);
            if(result!=null){
                return result
            }else{return []}
             
        }catch (e) {return []}    
    }   
}
