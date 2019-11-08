import { IsBoolean, IsString } from "class-validator";

export class ResourceFile {
  @IsString()
  src!: string;

  @IsBoolean()
  download?: boolean;
}
