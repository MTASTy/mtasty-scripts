import { IsString, ValidateNested } from "class-validator";
import { ResourceMap } from "./ResouceMap";
import { ResourceFile } from "./ResourceFile";

export class ResourceConfig {
  @IsString()
  type!: "client" | "server";

  @ValidateNested({ each: true })
  maps!: ResourceMap[];

  @ValidateNested({ each: true })
  files!: ResourceFile[];
}
