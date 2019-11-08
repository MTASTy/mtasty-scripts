import { IsBoolean, IsString, ValidateNested } from "class-validator";
import { ResourceMap } from "./ResouceMap";
import { ResourceFile } from "./ResourceFile";

export class ResourceConfig {
  @IsString()
  type!: "client" | "server";

  @IsBoolean()
  cache: boolean = false;

  @ValidateNested({ each: true })
  maps!: ResourceMap[];

  @ValidateNested({ each: true })
  files!: ResourceFile[];
}
