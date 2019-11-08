
/* tslint:disable */
import { resolve } from "path";
import { Dirent, promises as fsPromises } from "fs";
import * as path from "path";
import * as toposort from "toposort";
import {ResourceFile, ResourceMap} from "../types/ResourceConfig";
import * as builder from "xmlbuilder";

interface GenerateMetaOptions {
  fullPath: string;
  config: any;
}

async function getResourceScriptsList(fullPath: string, type: "client" | "server", cache: boolean) {
  const buildPath = path.resolve(`${fullPath}/build/`);
  let filesPaths = await getFilesPaths(buildPath) as string[];

  filesPaths.filter(filePath => path.extname(filePath) === ".lua");

  const filesDependencies = await Promise.all(
    filesPaths.map(filePath => fsPromises.readFile(filePath, "utf8")
      .then((content: string) => ({
        fileName: path.relative(fullPath, filePath),
        dependencies: getMatches(content, /require\("(.*)"\)/g)
          .map(m => path.normalize(`build/${m.split(".").join("/")}.lua`)),
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
    src: filePath,
    cache,
    type
  }));
}

async function getResourceFilesList(fullPath: string, files: ResourceFile[]) {
  const result = [];

  for (const item of files) {
    const filesPaths = await getFilesPaths(item.src);
    result.push(...filesPaths.map((filePath: string) => ({
        src: path.relative(fullPath, filePath),
        download: item.download
    })));
  }
  return result;
}

async function getResourceMapsList(fullPath: string, maps: ResourceMap[]) {
  const result = [];

  for (const item of maps) {
    const filesPaths = await getFilesPaths(item.src);
    result.push(...filesPaths.map((filePath: string) => ({
      src: path.relative(fullPath, filePath),
      dimension: item.dimension
    })));
  }
  return result;
}

export async function generateMeta(options: GenerateMetaOptions) {
  const mtasty = options.config.mtasty;

  const [ scripts, files, maps ] = await Promise.all([
    getResourceScriptsList(options.fullPath, mtasty.type, mtasty.cache),
    getResourceFilesList(options.fullPath, mtasty.files),
    getResourceMapsList(options.fullPath, mtasty.maps)
  ]);

  const xmlObject = {
    meta: {
      info: {
        '@type': 'script',
        '@author': options.config.author,
        '@name': options.config.name,
        '@version': options.config.version,
      }
    }
  };

  //Start xml file declaration
  const xmlFile = builder.create("meta");

  xmlFile.ele("info", {
    author: options.config.author || "",
    name: options.config.name || "",
    description: options.config.description || "",
    version: options.config.version || "",
    type: "script"
  });

  // Core integration
  let coreScripts: any[] = [];

  if (mtasty.type === "client") {
    coreScripts = await getResourceScriptsList(
      path.resolve(options.fullPath, "/node_modules/@mtasty/core-client/build/"),
      "client",
      mtasty.cache
    );
  } else {
    coreScripts = await getResourceScriptsList(
      path.resolve(options.fullPath, "/node_modules/@mtasty/core-server/build/"),
      "server",
      mtasty.cache
    );
  }

  coreScripts.forEach((script) => xmlFile.ele("script", {
    ...script
  }));

  // Adding scripts to xml
  scripts.forEach((script) => xmlFile.ele("script", {
    ...script
  }));

  // Adding maps to xml
  maps.forEach((map) => xmlFile.ele("map", {
    ...map
  }));

  // Adding files to xml
  files.forEach((file) => xmlFile.ele("file", {
    ...file
  }));

  xmlFile.ele("oop", {}, "true");

  await fsPromises.writeFile(options.fullPath + "/meta.xml", xmlFile.end({pretty: true}),"utf8")
}

function getMatches(string: string, regex: RegExp, index?: number) {
  index || (index = 1); // default to the first capturing group
  let matches = [];
  let match = regex.exec(string);

  while (match) {
    matches.push(match[index]);
  }
  return matches;
}

async function getFilesPaths(directoryOrFilePath: string): Promise<any> {
  let dirEntries: Dirent[];

  try {
    const stat = await fsPromises.lstat(directoryOrFilePath);

    if (stat.isFile()) {
      return [directoryOrFilePath];
    }

    if (!stat.isDirectory()) {
      return [];
    }

  } catch (e) {
    console.log("Can't execute lstat");
    return [];
  }

  try {
    dirEntries = await fsPromises.readdir(directoryOrFilePath, { withFileTypes: true });
  } catch (e) {
    // TODO: Add warning
    return [];
  }

  const files = await Promise.all(dirEntries.map((item) => {
    const fullPath = resolve(directoryOrFilePath, item.name);
    return item.isDirectory() ? getFilesPaths(fullPath) : fullPath;
  }));

  return Array.prototype.concat(...files);
}
