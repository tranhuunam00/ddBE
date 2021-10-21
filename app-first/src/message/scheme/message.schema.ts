import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { required } from 'joi';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema()

export class Message {
  @Prop()
  message: string;
  @Prop()
  path: string;
  @Prop()
  sourceId:string;
  @Prop()
  targetId: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
// import * as mongoose from 'mongoose';

// export const MessageSchema = new mongoose.Schema({
//   name: String,
//   age: Number,

// });