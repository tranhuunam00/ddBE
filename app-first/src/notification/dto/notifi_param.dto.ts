import { Type } from "class-transformer";
import { IsOptional, IsInt, IsDate, IsString } from "class-validator";


export class FilterNotifiDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 50;


  @IsOptional()
  @IsInt()
  @Type(() => Number)
  offset?: number = 50;

  @IsOptional()
  @IsString()
  @Type(() => String)
  sourceUserId?: string = "";

  @IsOptional()
  @IsString()
  @Type(() => String)
  targetUserId?: string = "";

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startedAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endedAt?: Date;
}