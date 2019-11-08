#!/usr/bin/env node

import * as program from "commander";
import { parseConfig, parsePath } from "./utils";
import { generateMeta } from "./scripts/generate-meta";
import { buildProject } from "./scripts/build";

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
      await generateMeta({ fullPath, config });
    } catch (e) {
      console.error(e.toString());
    }
  });

program.parse(process.argv);
