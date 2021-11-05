import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { required } from 'joi';
import { Date, Document } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema()

export class Token {
  @Prop()
  Token: string;
  @Prop()
  isLogin:boolean;
  @Prop()
  createdAt:string;
  
}

export const TokenSchema = SchemaFactory.createForClass(Token);
// import * as mongoose from 'mongoose';

// export const TokenSchema = new mongoose.Schema({
//   name: String,
//   age: Number,

// });