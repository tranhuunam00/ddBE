import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class BaseMessageDto {
  @IsString()
    path: string 
  @IsString()
    message:string
  @IsString()
    sourceId:string
  @IsString()
    targetId:string
  @IsString()
    time:string
}
//
export class CreateMessageDto extends BaseMessageDto {}
//
export class UpdateMessageDto extends BaseMessageDto {
  completedAt: Date;
}