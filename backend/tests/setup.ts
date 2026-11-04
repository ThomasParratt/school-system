import dotenv from "dotenv";
import { buildOpenApiDocument } from "../src/lib/openapi.js";

dotenv.config({
  path: ".env.test",
});

const spec = buildOpenApiDocument();

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