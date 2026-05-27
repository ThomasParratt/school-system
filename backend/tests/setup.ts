import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import YAML from "yaml";

dotenv.config({
  path: ".env.test",
});

const file = fs.readFileSync(
  path.join(process.cwd(), "./openapi.yaml"),
  "utf8"
);

const spec = YAML.parse(file);

const jestOpenAPIModule = (await import("jest-openapi")) as {
  default?: unknown;
  [key: string]: unknown;
};

const jestOpenAPI =
  (typeof jestOpenAPIModule.default === "function"
    ? jestOpenAPIModule.default
    : (jestOpenAPIModule.default as { default?: unknown })?.default) as
    | ((filepathOrObject: string | Record<string, unknown>) => void)
    | undefined;

if (typeof jestOpenAPI !== "function") {
  throw new TypeError("Unable to resolve jest-openapi default export");
}

jestOpenAPI(spec);