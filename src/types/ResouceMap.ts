import { IsNumber, IsOptional, IsString } from "class-validator";

export class ResourceMap {
  @IsString()
  src!: string;

  @IsNumber()
  @IsOptional()
  dimension?: number;
}
