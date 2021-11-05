
import { Connection } from 'mongoose';
import { FeedSchema } from './scheme/feed.schema';


export const FeedsProviders = [
  {
    provide: 'FEED_MODEL',
    useFactory: (connection: Connection) => connection.model('feeds', FeedSchema),
    inject: ['DATABASE_CONNECTION'],
  },
];