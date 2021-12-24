import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseCommentDto } from '../dto/comment';

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
  comment:BaseCommentDto[];
  @Prop()
  sourceUserName:string;
  @Prop()
  pathImg:string[]
  @Prop()
  
  pathVideo:string[]
  @Prop()
  
  rule:string[]
  @Prop()
  tag:string[]
  @Prop()
  createdAt:string;
}

export const FeedSchema = SchemaFactory.createForClass(Feed);
