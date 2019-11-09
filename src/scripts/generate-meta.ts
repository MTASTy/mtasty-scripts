/* tslint:disable */
import * as path from "path";
import { promises as fsPromises } from "fs";
import * as toposort from "toposort";
import * as builder from "xmlbuilder";
import { ResourceMap } from "../types/ResouceMap";
import { ResourceFile } from "../types/ResourceFile";
import { PackageConfig } from "../types/PackageConfig";
import { getFilesPaths } from "../utils";

interface GenerateMetaOptions {
  fullPath: string;
  config: PackageConfig;
}

export async function generateMeta(options: GenerateMetaOptions) {
  const mtasty = options.config.mtasty;

  const getCoreScriptsListConfig = {
    fullPath: options.fullPath,
    buildPath: path.join(options.fullPath, `node_modules/@mtasty/core-${mtasty.type}/build/`),
    type: mtasty.type,
    cache: mtasty.cache
  };

  const getResourceScriptsListConfig = {
    fullPath: options.fullPath,
    buildPath: path.join(options.fullPath, "build"),
    type: mtasty.type,
    cache: mtasty.cache
  };

  const [ coreScripts, resourceScripts, files, maps ] = await Promise.all([
    getScriptsList(getCoreScriptsListConfig),
    getScriptsList(getResourceScriptsListConfig),
    getFilesList(options.fullPath, mtasty.files),
    getMapsList(options.fullPath, mtasty.maps)
  ]);

  const xmlFile = builder.create("meta");

  xmlFile.ele("info", {
    author: options.config.author || "",
    name: options.config.name || "",
    description: options.config.description || "",
    version: options.config.version || "",
    type: "script"
  });

  coreScripts.forEach((script) => xmlFile.ele("script", { ...script }));
  resourceScripts.forEach((script) => xmlFile.ele("script", { ...script }));
  maps.forEach((map) => xmlFile.ele("map", { ...map }));
  files.forEach((file) => xmlFile.ele("file", { ...file }));

  xmlFile.ele("oop", {}, "true");

  const metaContent = xmlFile.end({ pretty: true });
  await fsPromises.writeFile(path.join(options.fullPath, "meta.xml"), metaContent,"utf8")
}

function getMatches(string: string, regex: RegExp, index: number = 1) {
  const matches = [];
  let match;
  // noinspection JSAssignmentUsedAsCondition
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }

  return matches;
}

async function getScriptsList({ fullPath, buildPath, type, cache }: { fullPath: string, buildPath: string, type: "client" | "server", cache: boolean})
{
  const filesPaths = (await getFilesPaths(buildPath))
    .filter(filePath => path.extname(filePath) === ".lua");

  const filesDependencies = await Promise.all(
    filesPaths.map(filePath => fsPromises.readFile(filePath, "utf8")
      .then((content: string) => ({
        fileName: path.relative(fullPath, filePath),
        dependencies: getMatches(content, /require\("(.*)"\)/g)
          .map(m => path.join(path.relative(fullPath, buildPath), `${m.split(".").join("/")}.lua`)),
      }))
    )
  );

  let withoutRelations = [];
  const relations: [ string, string ][] = [];

  for (const item of filesDependencies) {
    if (item.dependencies.length === 0) {
      withoutRelations.push(item.fileName);
      continue;
    }

    for (const dependency of item.dependencies) {
      relations.push([ item.fileName, dependency ]);
    }
  }

  const topologicalSortedByRelations = toposort(relations).reverse();
  withoutRelations = withoutRelations.filter(item => !topologicalSortedByRelations.includes(item));

  return [ ...topologicalSortedByRelations, ...withoutRelations ].map((filePath: string) => ({
    src: filePath.replace(/\\/g, "/"),
    cache,
    type
  }));
}

async function getFilesList(fullPath: string, files: ResourceFile[]) {
  const result = [];

  for (const item of files) {
    const filesPaths = await getFilesPaths(item.src);
    result.push(...filesPaths.map((filePath: string) => ({
        src: path.relative(fullPath, filePath).replace(/\\/g, "/"),
        download: item.download
    })));
  }
  return result;
}

async function getMapsList(fullPath: string, maps: ResourceMap[]) {
  const result = [];

  for (const item of maps) {
    const filesPaths = await getFilesPaths(item.src);
    result.push(...filesPaths.map((filePath: string) => ({
      src: path.relative(fullPath, filePath).replace(/\\/g, "/"),
      dimension: item.dimension
    })));
  }
  return result;
}
