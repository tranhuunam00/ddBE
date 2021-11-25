import { Document } from 'mongoose';
import { Message } from '../scheme/message.schema';

export interface AllMsgFrI {
    [index: string]: Message[]
} 