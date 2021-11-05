import { IsArray, IsInt, IsNotEmpty, IsString } from "class-validator";

export class BaseFeedDto {
  @IsString()
   pathImg: string 
  @IsString()
   message:string
  @IsString()
    sourceId:string
  @IsArray()
    rule:string[]
  @IsString()
    createdAt:string
}
//
export class CreateFeedDto extends BaseFeedDto {}
//
export class UpdateFeedDto extends BaseFeedDto {
  completedAt: Date;
}