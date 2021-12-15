import { IsArray, IsInt, IsNotEmpty, IsString } from "class-validator";


export class BaseNotifiDto {
  
    readonly type: string 

    readonly content:string 

    readonly createdAt:string
 
    readonly sourceUserId:string

    readonly targetUserId:string

}
//
