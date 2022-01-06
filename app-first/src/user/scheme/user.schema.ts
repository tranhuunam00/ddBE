import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()

export class User {
  @Prop({ required: true })
  userName: string;
  @Prop()
  email: string;
  @Prop()
  realName: string;
  @Prop()
  addressTinh: string;
  @Prop()
  addressDetails: string;
  @Prop()
  sex: string;
  @Prop()
  birthDate: string;
  @Prop()
  password:string
  @Prop()
  createdAt:string
  @Prop()
  seenTimeNotifi:string
  @Prop()
  avatarImg: string[];
  @Prop()
  coverImg: string[];
  @Prop()
  friend:string[]
  @Prop()
  friendRequest:string[]
  @Prop()
  friendConfirm:string[]
  @Prop()
  hadMessageList:string[]
  @Prop()
  feedImg:string[]
  @Prop()
  feedVideo:string[]
}

export const UserSchema = SchemaFactory.createForClass(User);
// import * as mongoose from 'mongoose';

// export const UserSchema = new mongoose.Schema({
//   name: String,
//   age: Number,

// });