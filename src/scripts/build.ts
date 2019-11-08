import * as rimraf from "rimraf";
import * as path from "path";
import { spawnSync } from "child_process";
import { generateMeta } from "./generate-meta";

interface IBuildOptions {
  fullPath: string;
  config: any;
}

export async function buildProject(options: IBuildOptions) {
  const {config, fullPath} = options;
  rimraf.sync(path.resolve(fullPath, "/build"));
  spawnSync("tstl", ["-p", path.resolve(fullPath, "/tsconfig.json")], { encoding: "utf8" });
  await generateMeta({ fullPath, config });
}
