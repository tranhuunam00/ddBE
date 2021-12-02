import { IsArray, IsInt, IsNotEmpty, IsString } from "class-validator";

export class BaseCommentDto {
  @IsString()
    pathImg: string 
  @IsString()
    messages:string 
  @IsString()
    sourceUserId:string
  @IsString()
    createdAt:string
 
}
//
