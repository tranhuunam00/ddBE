import { Type } from "class-transformer";
import { IsOptional, IsInt, IsDate, IsString } from "class-validator";


export class FilterFeedDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 20;


  @IsOptional()
  @IsInt()
  @Type(() => Number)
  offset?: number = 20;

  @IsOptional()
  @IsString()
  @Type(() => String)
  sourceId?: string = "";

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startedAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endedAt?: Date;
}