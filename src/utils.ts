import * as fs from "fs";
import { Dirent, promises as fsPromises } from "fs";
import * as path from "path";
import { resolve } from "path";
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

  const fullPath = input.indexOf(".") === 0
    ? path.join(process.cwd(), input)
    : path.resolve(input);

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

  if (!config.mtasty.files) {
    config.mtasty.files = [];
  }

  if (!config.mtasty.maps) {
    config.mtasty.maps = [];
  }

  return config;
}

export async function getFilesPaths(directoryOrFilePath: string): Promise<string[]> {
  let dirEntries: Dirent[];

  try {
    const stat = await fsPromises.lstat(directoryOrFilePath);
    if (stat.isFile()) {
      return [directoryOrFilePath];
    } else if (!stat.isDirectory()) {
      return [];
    }
  } catch (e) {
    return [];
  }

  try {
    dirEntries = await fsPromises.readdir(directoryOrFilePath, { withFileTypes: true });
  } catch (e) {
    return [];
  }

  const files = await Promise.all(dirEntries.map((item) => {
    const fullPath = resolve(directoryOrFilePath, item.name);
    return item.isDirectory() ? getFilesPaths(fullPath) : [fullPath];
  }));

  return Array.prototype.concat(...files);
}
