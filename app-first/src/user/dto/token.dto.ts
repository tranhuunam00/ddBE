import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class BaseTokenDto {
  jwt: string;
  isLogin: string;
  createdAt: string;
}
//
