import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type NotifiDocument = Notifi & Document;

@Schema()

export class Notifi {
  @Prop()
  type: string;
  @Prop()
  isSeen: boolean;
  @Prop()
  createdAt: string;
  @Prop()
  sourceUserId:string;
  @Prop()
  targetUserId:string
  @Prop()
  content: string;
}

export const NotifiSchema = SchemaFactory.createForClass(Notifi);
