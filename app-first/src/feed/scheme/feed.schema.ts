import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedDocument = Feed & Document;

@Schema()

export class Feed {
  @Prop()
  feedString: string;
  
  @Prop()
  feedImage:string
}

export const FeedSchema = SchemaFactory.createForClass(Feed);
