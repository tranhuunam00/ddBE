import { Document } from 'mongoose';

export interface UserI extends Document {
  readonly userName: string;
  readonly age: string;
  readonly password: string;


}