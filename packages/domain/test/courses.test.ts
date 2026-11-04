import { describe, expect, it } from "vitest";
import { ROLES, type Role } from "@school/contracts";
import { canTeach, enrollmentDecision } from "../src/index.js";

describe("canTeach", () => {
  it.each<[Role, boolean]>([
    ["instructor", true],
    ["admin", false],
    ["student", false],
  ])("%s -> %s", (role, expected) => {
    expect(canTeach(role)).toBe(expected);
  });
});

describe("enrollmentDecision", () => {
  it.each<[Role, ReturnType<typeof enrollmentDecision>]>([
    ["student", { allowed: true }],
    ["instructor", { allowed: false, reason: "NOT_A_STUDENT" }],
    ["admin", { allowed: false, reason: "NOT_A_STUDENT" }],
  ])("%s -> %j", (role, expected) => {
    expect(enrollmentDecision(role)).toEqual(expected);
  });

  it("covers every role", () => {
    for (const role of ROLES) expect(enrollmentDecision(role)).toBeDefined();
  });
});
