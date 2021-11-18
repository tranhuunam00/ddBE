import { IsArray, IsInt, IsNotEmpty, IsString } from "class-validator";

export class BaseFeedDto {
  @IsString()
    pathImg: string[] 
  @IsString()
    messages:string 
  @IsString()
    sourceUserId:string
  @IsArray()
    rule:string[]
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