import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class BaseUserDto {
 
  userName: string;

  password: string;
  email: string;
}
//
export class CreateUserDto extends BaseUserDto {}
//
export class CreateUserComfirmDto extends BaseUserDto {
  
  token:string;
}
//
export class UpdateUserDto extends BaseUserDto {
  completedAt: Date;
}