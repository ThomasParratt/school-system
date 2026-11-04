import { describe, expect, it } from "vitest";
import {
  buildOpenApiFragment,
  COURSE_ROUTES,
  COURSES_BASE_PATH,
  OPENAPI_COMPONENTS,
  ROUTE_DOCS,
  toOpenApiPath,
} from "../src/index.js";

const fragment = buildOpenApiFragment();
const text = JSON.stringify(fragment);

describe("buildOpenApiFragment", () => {
  it("documents every course route", () => {
    const documented = new Set(ROUTE_DOCS.map((route) => route.path));
    for (const route of Object.values(COURSE_ROUTES)) {
      expect(documented).toContain(COURSES_BASE_PATH + (route === "/" ? "" : route));
    }
  });

  it("writes one operation per route doc", () => {
    for (const route of ROUTE_DOCS) {
      expect(fragment.paths[toOpenApiPath(route.path)]?.[route.method]).toBeDefined();
    }
  });

  it("names every component and points every ref at one", () => {
    expect(Object.keys(fragment.schemas).sort()).toEqual(Object.keys(OPENAPI_COMPONENTS).sort());
    expect(text).not.toContain("#/definitions/");
    const refs = [...text.matchAll(/"#\/components\/schemas\/([A-Za-z]+)"/g)].map((match) => match[1]);
    for (const name of refs) expect(fragment.schemas).toHaveProperty(name!);
  });

  it("refers to the user from a course enrollment instead of copying it", () => {
    expect(JSON.stringify(fragment.schemas.CourseEnrollment)).toContain(
      '"$ref":"#/components/schemas/User"',
    );
  });

  it("never documents a password", () => {
    expect(text).not.toMatch(/password/i);
  });

  it("answers every error with the shared error body", () => {
    for (const route of ROUTE_DOCS) {
      const responses = fragment.paths[toOpenApiPath(route.path)]![route.method] as {
        responses: Record<string, { content: Record<string, { schema: unknown }> }>;
      };
      for (const status of Object.keys(route.errors)) {
        expect(responses.responses[status]!.content["application/json"]!.schema).toEqual({
          $ref: "#/components/schemas/Error",
        });
      }
    }
  });
});
