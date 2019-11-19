import * as rimraf from "rimraf";
import * as path from "path";
import * as tstl from "@mtasty/typescript-to-lua";
import * as ts from "typescript";
import { generateMeta } from "./generate-meta";
import { PackageConfig } from "../types/PackageConfig";

interface IBuildOptions {
  fullPath: string;
  config: PackageConfig;
}

export async function buildProject(options: IBuildOptions) {
  const {config, fullPath} = options;
  const buildPath = path.join(fullPath, "build");

  rimraf.sync(buildPath);

  const configFileName = path.join(fullPath, "tsconfig.json");
  const { emitResult, diagnostics } = tstl.transpileProject(configFileName);
  emitResult.forEach(({ name, text }: { name: string, text: string }) => {
    const exportsKey = path.relative(path.resolve(options.fullPath), path.resolve(name)).replace(/\\/g, "/");
    const convertedExportsText = text
      .replace(/local ____exports = {}/gmis, `____exports["${exportsKey}"] = {}`)
      .replace(/____exports\./gmis, `____exports["${exportsKey}"].`)
      .replace(/return ____exports/gmis, "")
    ;

    ts.sys.writeFile(name, convertedExportsText);
  });

  const reportDiagnostic = tstl.createDiagnosticReporter(true);
  diagnostics.forEach(reportDiagnostic);

  const scriptsPaths = emitResult.map(({ name }: { name: string }) => name);
  await generateMeta({ fullPath, scriptsPaths, config });
}
