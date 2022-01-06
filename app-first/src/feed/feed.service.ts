import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseFeedDto, CreateFeedDto } from './dto/feed.dto';

import { Feed, FeedDocument } from './scheme/feed.schema';
import { UserService } from '../user/user.service';
import { BaseCommentDto } from './dto/comment';
import { MessageBody, SubscribeMessage, WebSocketServer } from '@nestjs/websockets';
import { Server,Socket  } from 'socket.io';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class FeedService {
    constructor( @Inject("FEED_MODEL")  private feedModel:Model<FeedDocument>,
    private userService: UserService,
    private notifiService: NotificationService
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
    async testRule( rule:string ){
        console.log(rule)

        return  await this.feedModel.findOneAndUpdate({rule:{$not:{$in:[rule]}}},
            {$addToSet: {rule: "kk"}})
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
         if(a!=null){
            return a
         }
            
        }
        catch (err) { return []};
    }   
    //
    async findLimitRule(limit:number,offset:number,sourceId:string,rule:string):Promise<BaseFeedDto[]>{
        try {var a= await this.feedModel.find({sourceUserId:sourceId,rule:rule}).skip(offset).limit(limit).sort({createdAt:-1}).exec();
         if(a!=null){
            return a
         }
            
        }
        catch (err) { return []};
    }   
    //----------------like tym-----------------
    async likeFeed(sourceId:string,feedId:string,event:string,createdAt:string){
        try{
            const a= await this.userService.findById(sourceId);
            const b= await this.feedModel.findOne({_id:feedId});
            if(a!=null||b!=null){
                let sourceFeedId = b.sourceUserId
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
                       await Promise.all([
                            this.feedModel.findOneAndUpdate({_id:feedId},{like:listLike}),
                            this.notifiService.create({type: "likeFeed",targetUserId:[sourceFeedId],
                                                sourceUserId: sourceId,createdAt:createdAt,content:feedId})
                        ]);

                       return b.sourceUserId
                    }
                }
            }else{
                return "error"
            }
            
        }catch(e){return "error"}
       
    }
    ///comment
    async createComment(feedId:string,comment : BaseCommentDto){
        try{
            let result = await this.feedModel.findOne({_id: feedId})
            if(result!=null){
                console.log("có bài viết này--------")
                const feed=result.toObject()
                let listComment =feed.comment;
                listComment.push(comment)
                console.log(listComment)
          
                let allUserEmit =  [result.sourceUserId,...result.tag]
                for(let i = 0; i < allUserEmit.length;i++){
                    if(allUserEmit[i]==comment.sourceUserId!){
                        allUserEmit.splice(i,1);
                        i--;
                    }
                }
                await Promise.all([
                           
                    this.feedModel.findOneAndUpdate({_id:feedId},{comment:listComment}).exec(),
                    this.notifiService.createNotifiComment({type: "commentFeed",targetUserId:allUserEmit,sourceUserId:comment.sourceUserId,
                        createdAt:comment.createdAt,content:feedId})
                        
                ]);
               
                
                
                return result
                
            }else{return "error"}
        }catch(e){return "error"}
    }//get commnet
    async getComment(feedId:string){
        try{
            let result = await this.feedModel.findOne({_id: feedId})
            if(result!=null){
                console.log("có bài viết này--------")
                const feed=result.toObject()
                let listComment =feed.comment;
                return listComment
                
            }else{return "error"}

        }catch(e){return "error"}
    }
    //
    async updateComment(feedId:string,comment : BaseCommentDto,newMessage:string,newPathImg:string){
        try{
            let result = await this.feedModel.findOne({_id: feedId})
            if(result!=null){
                console.log("có bài viết này--------")
                const feed=result.toObject()
                let isCmt=false
                let index=-1;
                let listComment =feed.comment;
                for(let i=0;i<listComment.length;i++){
                    if(listComment[i].createdAt==comment.createdAt&&listComment[i].messages==comment.messages
                        &&listComment[i].pathImg==comment.pathImg&&listComment[i].sourceUserId==comment.sourceUserId){
                        index=i
                        isCmt=true
                    }
                }
                console.log(index)
                if(index!=-1){
                    listComment[index].messages=newMessage,
                    listComment[index].pathImg=newPathImg,
                    await this.feedModel.findOneAndUpdate({_id:feedId},{comment:listComment}).exec()

                }else{return "error"}
                
                return "done"
                
            }else{return "error"}
        }catch(e){return "error"}
    }
    async deleteComment(feedId:string,comment :BaseCommentDto){
        try{
            let result = await this.feedModel.findOne({_id: feedId})
            if(result!=null){
                console.log("có bài viết này--------")
                const feed=result.toObject()
                let isCmt=false
                let index=-1;
                let listComment =feed.comment;
                for(let i=0;i<listComment.length;i++){
                    if(listComment[i].createdAt==comment.createdAt&&listComment[i].messages==comment.messages
                        &&listComment[i].pathImg==comment.pathImg&&listComment[i].sourceUserId==comment.sourceUserId){
                        index=i
                        isCmt=true
                    }
                }
                console.log(index)
                if(index!=-1){
                    listComment.splice(index,1)
                    await this.feedModel.findOneAndUpdate({_id:feedId},{comment:listComment}).exec()

                }else{return "error"}
                
                return "done"
                
            }else{return "error"}
        }catch(e){return "error"}
    }
    async deleteFeed(feedId:string){
        try{    
            const feedApi = await this.feedModel.findOneAndDelete({_id:feedId})
            if(feedApi!=null){
                return "done"
            }else{return "error"}
        }catch(e){return "error"}
    }
}
