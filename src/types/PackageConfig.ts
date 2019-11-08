import { IsOptional, IsString, ValidateNested } from "class-validator";
import { ResourceConfig } from "./ResourceConfig";

export class PackageConfig {
  @IsString()
  @IsOptional()
  name!: string;

  @IsString()
  @IsOptional()
  author!: string;

  @IsString()
  @IsOptional()
  version!: string;

  @IsString()
  @IsOptional()
  description!: string;

  @ValidateNested()
  mtasty!: ResourceConfig;
}
