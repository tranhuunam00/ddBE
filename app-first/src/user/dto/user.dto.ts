import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class BaseUserDto {
 
  userName: string;
  age: string;
  password: string;

}
//
export class CreateUserDto extends BaseUserDto {}
//
export class UpdateUserDto extends BaseUserDto {
  completedAt: Date;
}