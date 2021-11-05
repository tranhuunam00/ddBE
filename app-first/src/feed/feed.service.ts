import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { CreateFeedDto } from './dto/feed.dto';

import { FeedDocument } from './scheme/feed.schema';

@Injectable()
export class FeedService {
    constructor( @Inject("FEED_MODEL")  private feedModel:Model<FeedDocument>){}
    async create(data:CreateFeedDto){
        console.log("create")
        let newfeed=new this.feedModel({
                      ...data,
                      
                    })
        return await  newfeed.save()
    }   
    
}
