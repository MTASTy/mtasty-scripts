import * as program from "commander";
import {parseConfig, parsePath} from "./utils";
import {generateMeta} from "./scripts/generate-meta";
import * as rimraf from "rimraf";
import * as path from "path";
import {spawnSync} from "child_process";
import {buildProject} from "./scripts/build";
import {validate} from "class-validator";
import {plainToClass} from "class-transformer";
import {ResourceConfig} from "./types/ResourceConfig";

program
  .command("build")
  .description("Build projects inside mtasty resource")
  .option("-p, --path [path]", "Specify path to mtasty-resource", ".")
  .action(async (env, options) => {
    try {
      const fullPath = parsePath(options.path);
      const config = parseConfig(fullPath);

      let configInstance = plainToClass(ResourceConfig, config);
      const validationErrors = await validate(configInstance);

      if (validationErrors.length > 0)
        throw new Error(`Config validation failed. Errors: ${validationErrors}`);

      await buildProject({fullPath, config});
    } catch (e) {
      console.error(e.toString());
    }
  });

program
  .command("generate-meta")
  .description("Generate meta.xml inside mtasty resource")
  .option("-p, --path [path]", "Specify path to mtasty-resource", ".")
  .action(async (env, options) => {
    try {
      const fullPath = parsePath(options.path);
      const config = parseConfig(fullPath);

      let configInstance = plainToClass(ResourceConfig, config);
      const validationErrors = await validate(configInstance);

      if (validationErrors.length > 0)
        throw new Error(`Config validation failed. Errors: ${validationErrors}`);

      await generateMeta({fullPath, config});

    } catch (e) {
      console.error(e.toString());
    }
  });
