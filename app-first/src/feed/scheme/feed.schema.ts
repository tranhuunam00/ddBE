import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedDocument = Feed & Document;

@Schema()

export class Feed {
  @Prop()
  feedString: string;
  @Prop()
  OwnId:string;
  @Prop()
  feedImage:string
  @Prop()
  rule:string[]
  @Prop()
  createdAt:string;
}

export const FeedSchema = SchemaFactory.createForClass(Feed);
