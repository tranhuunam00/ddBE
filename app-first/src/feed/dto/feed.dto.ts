import { IsArray, IsInt, IsNotEmpty, IsString } from "class-validator";
import { BaseCommentDto } from "./comment";

export class BaseFeedDto {
  @IsString()
    pathImg: string[] 
  @IsString()
    messages:string 
  @IsString()
    sourceUserId:string
  @IsArray()
    rule:string[]
  @IsArray()
    comment:BaseCommentDto[]
  @IsArray()
    like:string[]
  @IsString()
    createdAt:string
  @IsString()
    sourceUserName:string
}
//
export class CreateFeedDto extends BaseFeedDto {
  @IsString()
    createdAt:string
}
//
export class UpdateFeedDto extends BaseFeedDto {
  completedAt: Date;
}