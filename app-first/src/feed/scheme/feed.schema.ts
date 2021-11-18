import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FeedDocument = Feed & Document;

@Schema()

export class Feed {
  @Prop()
  messages: string;
  @Prop()
  sourceUserId:string;
  @Prop()
  like:string[];
  @Prop()
  sourceUserName:string;
  @Prop()
  pathImg:string[]
  @Prop()
  rule:string[]
  @Prop()
  createdAt:string;
}

export const FeedSchema = SchemaFactory.createForClass(Feed);
