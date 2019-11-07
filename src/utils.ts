import * as fs from "fs";
import * as path from "path";

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

export function parseConfig(resourcePath: string) {
  let configContent;

  try {
    configContent = fs.readFileSync(path.resolve(`${resourcePath}/package.json`), "utf8");
  } catch (e) {
    throw new Error("Target directory doesn't contains package.json");
  }

  let json;

  try {
    json = JSON.parse(configContent);
  } catch (e) {
    throw new Error("Target directory contains invalid package.json");
  }

  if (!json.mtasty) {
    throw new Error("Target directory contains package.json without MTASTy config");
  }

  return json;
}
