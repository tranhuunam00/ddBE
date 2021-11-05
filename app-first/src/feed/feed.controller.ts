import { Req } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { CreateFeedDto } from './dto/feed.dto';

import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
    constructor(
        private feedService: FeedService
    ){}
    @Post("")
    async create(@Body()   createFeedDto :CreateFeedDto, @Req() req){
        
        return await this.feedService.create(createFeedDto);
    }
}
