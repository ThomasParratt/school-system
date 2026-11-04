/**
 * The API document: openapi.base.yaml (the routes not moved yet) plus the
 * paths and schemas the contracts generate. /docs serves it and the tests
 * check every response against it, so it is built here once, never written
 * by hand twice. A path or schema in both places is refused.
 */
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { buildOpenApiFragment } from "@school/contracts";

export const OPENAPI_BASE_FILE = "openapi.base.yaml";

type OpenApiDocument = {
  paths: Record<string, unknown>;
  components: { schemas?: Record<string, unknown> } & Record<string, unknown>;
} & Record<string, unknown>;

export function buildOpenApiDocument(baseDir: string = process.cwd()): OpenApiDocument {
  const base = YAML.parse(
    fs.readFileSync(path.join(baseDir, OPENAPI_BASE_FILE), "utf8"),
  ) as OpenApiDocument;
  const generated = buildOpenApiFragment();

  const baseSchemas = base.components.schemas ?? {};
  for (const name of Object.keys(generated.schemas)) {
    if (name in baseSchemas) {
      throw new Error(`Schema ${name} is in ${OPENAPI_BASE_FILE} and in the contracts`);
    }
  }
  for (const route of Object.keys(generated.paths)) {
    if (route in base.paths) {
      throw new Error(`Path ${route} is in ${OPENAPI_BASE_FILE} and in the contracts`);
    }
  }

  return {
    ...base,
    components: { ...base.components, schemas: { ...baseSchemas, ...generated.schemas } },
    paths: { ...base.paths, ...generated.paths },
  };
}
