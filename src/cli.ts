#!/usr/bin/env node

import * as program from "commander";
import { getFilesPaths, parseConfig, parsePath } from "./utils";
import { generateMeta } from "./scripts/generate-meta";
import { buildProject } from "./scripts/build";
import * as path from "path";
import { MTAHelpersScriptName } from "./const/mta-helpers";

program
  .command("build")
  .description("Build projects inside mtasty resource")
  .option("-p, --path [path]", "Specify path to mtasty-resource", ".")
  .action(async (options) => {
    try {
      const fullPath = parsePath(options.path);
      const config = await parseConfig(fullPath);
      await buildProject({ fullPath, config });
    } catch (e) {
      console.error(e.toString());
    }
  });

program
  .command("generate-meta")
  .description("Generate meta.xml inside mtasty resource")
  .option("-p, --path [path]", "Specify path to mtasty-resource", ".")
  .action(async (options) => {
    try {
      const fullPath = parsePath(options.path);
      const config = await parseConfig(fullPath);

      const scriptsPaths = (await getFilesPaths(path.join(fullPath, "build")))
        .filter(filePath => path.extname(filePath) === ".lua")
        .filter(filePath => path.basename(filePath) !== MTAHelpersScriptName)
      ;

      await generateMeta({ fullPath, scriptsPaths, config });
    } catch (e) {
      console.error(e.toString());
    }
  });

program.parse(process.argv);
