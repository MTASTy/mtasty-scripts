export class ResourceConfig {
  type: "client" | "server";
  maps: ResourceMap[];
  files: ResourceFile[];
}

export class ResourceMap {
  src: string;
  dimension?: number;
}

export class ResourceFile {
  src: string;
  download?: boolean;
}

