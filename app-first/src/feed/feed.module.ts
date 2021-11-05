import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FeedController } from './feed.controller';
import { FeedsProviders } from './feed.providers';
import { FeedService } from './feed.service';
import { UserSchema } from '../user/scheme/user.schema';
import { Feed } from './scheme/feed.schema';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule,MongooseModule.forFeature([{name:Feed.name,schema:UserSchema}])],
  controllers: [FeedController],
  providers: [FeedService,...FeedsProviders],
  exports : [FeedService]
})
export class FeedModule {}
