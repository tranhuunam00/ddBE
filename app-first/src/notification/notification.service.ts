import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseNotifiDto } from './dto/notifi_dto';
import { NotifiDocument } from './scheme/Notifi.schema';



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
}
