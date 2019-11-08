import { IsOptional, IsString, ValidateNested } from "class-validator";
import { ResourceMap } from "./ResouceMap";
import { ResourceFile } from "./ResourceFile";

export class ResourceConfig {
  @IsString()
  type!: "client" | "server";

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

  @ValidateNested({ each: true })
  maps!: ResourceMap[];

  @ValidateNested({ each: true })
  files!: ResourceFile[];
}
