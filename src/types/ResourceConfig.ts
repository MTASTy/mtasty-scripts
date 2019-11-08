import {IsString, ValidateNested} from "class-validator";

export class ResourceConfig {
  @IsString()
  type!: "client" | "server";

  @IsString()
  name!: string;

  @IsString()
  author!: string;

  @IsString()
  version!: string;

  @IsString()
  description!: string;

  @ValidateNested({ each: true })
  maps!: ResourceMap[];

  @ValidateNested({ each: true })
  files!: ResourceFile[];
}

export class ResourceMap {
  @IsString()
  src!: string;

  @IsString()
  dimension?: number;
}

export class ResourceFile {
  @IsString()
  src!: string;

  @IsString()
  download?: boolean;
}

