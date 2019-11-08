import * as fs from "fs";
import * as path from "path";
import { PackageConfig } from "./types/PackageConfig";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

export function parsePath(input: unknown): string {
  if (input === undefined) {
    input = ".";
  }

  if (input === true) {
    throw new Error("CLI option path expects an argument.");
  }

  if (typeof input !== "string") {
    throw new Error("CLI option path expects an string argument.");
  }

  const fullPath = path.resolve(input);
  const isDirectory = fs.lstatSync(fullPath).isDirectory();
  if (!isDirectory) {
    throw new Error("CLI option path expects path to target directory.");
  }

  return fullPath;
}

export async function parseConfig(resourcePath: string): Promise<PackageConfig> {
  let configContent;

  try {
    configContent = fs.readFileSync(path.resolve(`${resourcePath}/package.json`), "utf8");
  } catch (e) {
    throw new Error("Target directory doesn't contains package.json");
  }

  let json: unknown;

  try {
    json = JSON.parse(configContent);
  } catch (e) {
    throw new Error("Target directory contains invalid package.json");
  }

  const config = plainToClass(PackageConfig, json);
  const validationErrors = await validate(config);

  if (validationErrors.length > 0) {
    throw new Error(`Config validation failed. Errors: ${validationErrors}`);
  }

  return config;
}
