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
  password:string
}

export const UserSchema = SchemaFactory.createForClass(User);
// import * as mongoose from 'mongoose';

// export const UserSchema = new mongoose.Schema({
//   name: String,
//   age: Number,

// });