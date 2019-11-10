import * as rimraf from "rimraf";
import * as path from "path";
import { generateMeta } from "./generate-meta";
import { PackageConfig } from "../types/PackageConfig";

interface IBuildOptions {
  fullPath: string;
  config: PackageConfig;
}

export async function buildProject(options: IBuildOptions) {
  let tstl: any;
  try {
    tstl = await import("typescript-to-lua");
  } catch (e) {
    throw new Error("Package typescript-to-lua isn't installed");
  }

  let ts: any;
  try {
    ts = await import("typescript");
  } catch (e) {
    throw new Error("Package typescript isn't installed");
  }

  const {config, fullPath} = options;
  rimraf.sync(path.resolve(fullPath, "/build"));

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

  await generateMeta({ fullPath, config });
}
