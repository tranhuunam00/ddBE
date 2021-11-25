import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseFeedDto, CreateFeedDto } from './dto/feed.dto';

import { Feed, FeedDocument } from './scheme/feed.schema';
import { UserService } from '../user/user.service';

@Injectable()
export class FeedService {
    constructor( @Inject("FEED_MODEL")  private feedModel:Model<FeedDocument>,
    private userService: UserService
    ){}
    //------------------------find one---------------------------
    async findOneById(id:string){
        try {
            const a= await this.feedModel.findOne({_id:id});
            if(a==null){
                return "error"
            }else{return a}
        }catch (e){
            return "error"
        }
    }
    //...........................
    async create(data:CreateFeedDto){
        try{
            let id :String;
            console.log("create")
             let newfeed=await new this.feedModel({
                      ...data,
                    })
            // console.log(newfeed.id);
            var a= await  newfeed.save()
            .then((feed) => {
                console.log(feed.id);
                return feed.id
            })
            .catch((err) => {return "error"})
            console.log(a)
            return a
    }catch(e){return "error"}
        
    }   
    async findLimit(limit:number,offset:number,sourceId:string):Promise<BaseFeedDto[]>{
        try {var a= await this.feedModel.find({sourceUserId:sourceId}).skip(offset).limit(limit).sort({createdAt:-1}).exec();
         console.log(a)
            return a
        }
        catch (err) { return []};
    }   
    //----------------like tym-----------------
    async likeFeed(sourceId:string,feedId:string,event:string){
        try{
            const a= await this.userService.findById(sourceId);
            const b= await this.feedModel.findOne({_id:feedId});
            if(a!=null&&b!=null){
                let listLike=b.like
                let isHad=false;
                console.log(b)
                if(event=="dislike"){
                    for(let i=0;i<listLike.length;i++){
                        if(listLike[i]==sourceId || listLike[i]==null){
                            if(listLike[i]==sourceId){isHad=true}
                            listLike.splice(i,1);
                            i--
                        }
                    }
                    console.log(listLike)
                    if(isHad){
                       await this.feedModel.findOneAndUpdate({_id:feedId},{like:listLike})
                       return b.sourceUserId
                    }else{return "error"}
                    
                }
                if(event=="like"){
                    console.log
                    for(let i=0;i<listLike.length;i++){
                        if(listLike[i]==sourceId || listLike[i]==null){
                            if(listLike[i]==sourceId){
                                isHad=true
                                return "error"
                            }
                            listLike.splice(i,1);
                            i--
                        }
                    }
                    console.log(listLike)
                    if(isHad==false){
                        listLike.push(sourceId);
                       await this.feedModel.findOneAndUpdate({_id:feedId},{like:listLike})
                       return b.sourceUserId
                    }
                }
            }else{
                return "error"
            }
            
        }catch(e){return "error"}
       
    }
}
