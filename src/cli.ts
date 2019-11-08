import * as program from "commander";
import { parseConfig, parsePath } from "./utils";
import { generateMeta } from "./scripts/generate-meta";
import { buildProject } from "./scripts/build";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { ResourceConfig } from "./types/ResourceConfig";

program
  .command("build")
  .description("Build projects inside mtasty resource")
  .option("-p, --path [path]", "Specify path to mtasty-resource", ".")
  .action(async (env, options) => {
    try {
      const fullPath = parsePath(options.path);
      const config = parseConfig(fullPath);

      const configInstance = plainToClass(ResourceConfig, config);
      const validationErrors = await validate(configInstance);

      if (validationErrors.length > 0) {
        console.error(`Config validation failed. Errors: ${validationErrors}`);
        return;
      }

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

      const configInstance = plainToClass(ResourceConfig, config);
      const validationErrors = await validate(configInstance);

      if (validationErrors.length > 0) {
        console.error(`Config validation failed. Errors: ${validationErrors}`);
        return;
      }

      await generateMeta({fullPath, config});

    } catch (e) {
      console.error(e.toString());
    }
  });

program.parse(process.argv);
