import { describe, expect, it } from "vitest";
import {
  coursePaths,
  CourseIdParamsSchema,
  CreateCourseBodySchema,
  EnrollBodySchema,
  EnrollmentParamsSchema,
  UPDATE_COURSE_FIELDS,
  UpdateCourseBodySchema,
} from "../src/index.js";

const validCourse = {
  title: "Intro to Finnish",
  language: "Finnish",
  level: "A1",
  material: "https://example.com/materials/finnish-a1",
  instructorId: 3,
};

describe("CreateCourseBodySchema", () => {
  it("accepts a complete course and drops unknown fields", () => {
    expect(CreateCourseBodySchema.parse({ ...validCourse, extra: true })).toEqual(validCourse);
  });

  it.each([
    ["a missing material", { ...validCourse, material: undefined }],
    ["a missing instructor", { ...validCourse, instructorId: undefined }],
    ["a blank title", { ...validCourse, title: "  " }],
    ["an unknown language", { ...validCourse, language: "Spanish" }],
    ["an unknown level", { ...validCourse, level: "C3" }],
    ["an instructor id as text", { ...validCourse, instructorId: "1" }],
    ["a zero instructor id", { ...validCourse, instructorId: 0 }],
  ])("rejects %s", (_name, body) => {
    expect(CreateCourseBodySchema.safeParse(body).success).toBe(false);
  });
});

describe("UpdateCourseBodySchema", () => {
  it("accepts any subset of the fields", () => {
    expect(UpdateCourseBodySchema.parse({ title: "New" })).toEqual({ title: "New" });
    expect(UpdateCourseBodySchema.parse({})).toEqual({});
  });

  it.each([
    ["an unknown language", { language: "Spanish" }],
    ["an instructor id as text", { instructorId: "not-an-id" }],
    ["a null title", { title: null }],
  ])("rejects %s", (_name, body) => {
    expect(UpdateCourseBodySchema.safeParse(body).success).toBe(false);
  });

  it("lists every field of a new course", () => {
    expect([...UPDATE_COURSE_FIELDS].sort()).toEqual(Object.keys(validCourse).sort());
  });
});

describe("the params and the enroll body", () => {
  it("turns path ids into numbers", () => {
    expect(CourseIdParamsSchema.parse({ id: "7" })).toEqual({ id: 7 });
    expect(EnrollmentParamsSchema.parse({ courseId: "7", studentId: "9" })).toEqual({
      courseId: 7,
      studentId: 9,
    });
  });

  it.each([{ userId: "1" }, { userId: 0 }, {}])("rejects the enroll body %j", (body) => {
    expect(EnrollBodySchema.safeParse(body).success).toBe(false);
  });
});

describe("coursePaths", () => {
  it("builds the full paths", () => {
    expect(coursePaths.list()).toBe("/courses");
    expect(coursePaths.course(4)).toBe("/courses/4");
    expect(coursePaths.enrollments(4)).toBe("/courses/4/enrollments");
    expect(coursePaths.enroll(4)).toBe("/courses/4/enroll");
    expect(coursePaths.enrollment(4, 8)).toBe("/courses/4/enrollments/8");
  });
});
