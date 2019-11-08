import { IsOptional, IsString, ValidateNested } from "class-validator";
import { ResourceConfig } from "./ResourceConfig";

export class PackageConfig {
  @IsString()
  @IsOptional()
  name: string = "unknown";

  @IsString()
  @IsOptional()
  author: string = "unknown";

  @IsString()
  @IsOptional()
  version: string = "1.0";

  @IsString()
  @IsOptional()
  description: string = "";

  @ValidateNested()
  mtasty!: ResourceConfig;
}
