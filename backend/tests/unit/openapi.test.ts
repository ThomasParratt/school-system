import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";
import { buildOpenApiFragment } from "@school/contracts";
import { buildOpenApiDocument, OPENAPI_BASE_FILE } from "../../src/lib/openapi.js";

const backendDir = path.resolve(import.meta.dirname, "../..");
const base = YAML.parse(fs.readFileSync(path.join(backendDir, OPENAPI_BASE_FILE), "utf8"));
const fragment = buildOpenApiFragment();

function withBase(change: (doc: typeof base) => void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "openapi-"));
  const doc = structuredClone(base);
  change(doc);
  fs.writeFileSync(path.join(dir, OPENAPI_BASE_FILE), YAML.stringify(doc));
  return dir;
}

describe("buildOpenApiDocument", () => {
  it("holds every base path and every contract path", () => {
    const document = buildOpenApiDocument(backendDir);
    for (const route of [...Object.keys(base.paths), ...Object.keys(fragment.paths)]) {
      expect(document.paths).toHaveProperty([route]);
    }
  });

  it("refuses a path written in the base file and in the contracts", () => {
    const route = Object.keys(fragment.paths)[0]!;
    const dir = withBase((doc) => {
      doc.paths[route] = fragment.paths[route];
    });
    expect(() => buildOpenApiDocument(dir)).toThrow(route);
  });

  it("refuses a schema written in the base file and in the contracts", () => {
    const dir = withBase((doc) => {
      doc.components.schemas.Course = fragment.schemas.Course;
    });
    expect(() => buildOpenApiDocument(dir)).toThrow("Course");
  });
});
