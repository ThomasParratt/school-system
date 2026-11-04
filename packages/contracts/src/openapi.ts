/**
 * The OpenAPI paths and component schemas of every route that has moved onto
 * the contracts, built from the zod schemas above. The backend merges them
 * into openapi.base.yaml (the routes not moved yet) at startup and in the
 * tests, so the document cannot drift from the schemas.
 */
import { z } from "zod";
import { COURSE_ROUTES, COURSES_BASE_PATH } from "./coursePaths.js";
import {
  CourseEnrollmentSchema,
  CourseEnrollmentsResponseSchema,
  CourseIdParamsSchema,
  CourseResponseSchema,
  CourseSchema,
  CoursesResponseSchema,
  CreateCourseBodySchema,
  EnrollBodySchema,
  EnrollmentParamsSchema,
  EnrollmentResponseSchema,
  EnrollmentSchema,
  UpdateCourseBodySchema,
} from "./courses.js";
import { ErrorResponseSchema, MessageResponseSchema } from "./http.js";
import { UserSchema } from "./users.js";

export type HttpMethod = "get" | "post" | "patch" | "delete";

export interface RouteDoc {
  method: HttpMethod;
  /** The Express path: the router's base path plus its route, e.g. "/courses/:id". */
  path: string;
  summary: string;
  params?: z.ZodObject;
  body?: z.ZodType;
  success: { status: number; description: string; schema: z.ZodType };
  /** Every error status the route answers, each with the shared error body. */
  errors: Record<number, string>;
}

/** The schemas the document names, under these names, wherever they appear. */
export const OPENAPI_COMPONENTS = {
  User: UserSchema,
  Course: CourseSchema,
  Enrollment: EnrollmentSchema,
  CourseEnrollment: CourseEnrollmentSchema,
  Error: ErrorResponseSchema,
} as const;

const UNAUTHORIZED = { 401: "Unauthorized", 403: "Forbidden" } as const;
const SERVER_ERROR = { 500: "Server error" } as const;

const course = (route: string) => COURSES_BASE_PATH + (route === "/" ? "" : route);

export const ROUTE_DOCS: RouteDoc[] = [
  {
    method: "get",
    path: course(COURSE_ROUTES.list),
    summary: "Get all courses (admin only)",
    success: { status: 200, description: "List of courses", schema: CoursesResponseSchema },
    errors: { ...UNAUTHORIZED, ...SERVER_ERROR },
  },
  {
    method: "post",
    path: course(COURSE_ROUTES.list),
    summary: "Create course (admin only)",
    body: CreateCourseBodySchema,
    success: { status: 201, description: "Course created", schema: CourseResponseSchema },
    errors: { 400: "Invalid input", ...UNAUTHORIZED, 404: "Instructor not found", ...SERVER_ERROR },
  },
  {
    method: "get",
    path: course(COURSE_ROUTES.course),
    summary: "Get course (admin only)",
    params: CourseIdParamsSchema,
    success: { status: 200, description: "Course", schema: CourseResponseSchema },
    errors: { 400: "Invalid ID", ...UNAUTHORIZED, 404: "Course not found", ...SERVER_ERROR },
  },
  {
    method: "patch",
    path: course(COURSE_ROUTES.course),
    summary: "Update course information (admin only)",
    params: CourseIdParamsSchema,
    body: UpdateCourseBodySchema,
    success: { status: 200, description: "Course updated", schema: CourseResponseSchema },
    errors: {
      400: "Invalid input or no fields",
      ...UNAUTHORIZED,
      404: "Course or instructor not found",
      ...SERVER_ERROR,
    },
  },
  {
    method: "delete",
    path: course(COURSE_ROUTES.course),
    summary: "Delete course (admin only)",
    params: CourseIdParamsSchema,
    success: { status: 200, description: "Course deleted", schema: MessageResponseSchema },
    errors: { 400: "Invalid ID", ...UNAUTHORIZED, 404: "Course not found", ...SERVER_ERROR },
  },
  {
    method: "get",
    path: course(COURSE_ROUTES.enrollments),
    summary: "Get a course's enrollments with the enrolled users (admin only)",
    params: CourseIdParamsSchema,
    success: { status: 200, description: "Enrollments", schema: CourseEnrollmentsResponseSchema },
    errors: { 400: "Invalid ID", ...UNAUTHORIZED, 404: "Course not found", ...SERVER_ERROR },
  },
  {
    method: "post",
    path: course(COURSE_ROUTES.enroll),
    summary: "Enroll a student (admin only)",
    params: CourseIdParamsSchema,
    body: EnrollBodySchema,
    success: { status: 201, description: "Enrollment created", schema: EnrollmentResponseSchema },
    errors: {
      400: "Invalid input, or the user is not a student",
      ...UNAUTHORIZED,
      404: "Course or user not found",
      409: "Student already enrolled in this course",
      ...SERVER_ERROR,
    },
  },
  {
    method: "delete",
    path: course(COURSE_ROUTES.enrollment),
    summary: "Remove a student from a course (admin only)",
    params: EnrollmentParamsSchema,
    success: { status: 200, description: "Enrollment deleted", schema: MessageResponseSchema },
    errors: { 400: "Invalid ID", ...UNAUTHORIZED, 404: "Enrollment not found", ...SERVER_ERROR },
  },
];

type JsonSchema = Record<string, unknown>;

export interface OpenApiFragment {
  paths: Record<string, Record<string, unknown>>;
  schemas: Record<string, JsonSchema>;
}

const COMPONENT_REF = "#/components/schemas/";
const ZOD_REF = "#/definitions/";

/** "/courses/:id" -> "/courses/{id}" */
export const toOpenApiPath = (expressPath: string) =>
  expressPath.replace(/:([A-Za-z0-9_]+)/g, "{$1}");

function componentRegistry() {
  const registry = z.registry<{ id: string }>();
  for (const [name, schema] of Object.entries(OPENAPI_COMPONENTS)) registry.add(schema, { id: name });
  return registry;
}

/** One schema as OpenAPI 3.0 JSON Schema, with the named components as refs. */
function convert(
  schema: z.ZodType,
  io: "input" | "output",
  registry: ReturnType<typeof componentRegistry>,
  schemas: Record<string, JsonSchema>,
): JsonSchema {
  const json = z.toJSONSchema(schema, {
    metadata: registry,
    target: "openapi-3.0",
    io,
    unrepresentable: "any",
  }) as JsonSchema;
  const { definitions, ...rest } = json as JsonSchema & { definitions?: Record<string, JsonSchema> };
  const rewrite = (value: JsonSchema) =>
    JSON.parse(JSON.stringify(value).replaceAll(`"${ZOD_REF}`, `"${COMPONENT_REF}`)) as JsonSchema;
  for (const [name, definition] of Object.entries(definitions ?? {})) {
    schemas[name] = rewrite(definition);
  }
  return rewrite(rest);
}

const jsonContent = (schema: JsonSchema) => ({ "application/json": { schema } });

export function buildOpenApiFragment(routes: RouteDoc[] = ROUTE_DOCS): OpenApiFragment {
  const registry = componentRegistry();
  const schemas: Record<string, JsonSchema> = {};
  // A component that only appears inside another still gets its own entry.
  for (const [name, schema] of Object.entries(OPENAPI_COMPONENTS)) {
    const json = convert(schema, "output", registry, schemas);
    if (!json.$ref) schemas[name] = json;
  }
  const errorRef = { $ref: `${COMPONENT_REF}Error` };

  const paths: OpenApiFragment["paths"] = {};
  for (const route of routes) {
    const path = toOpenApiPath(route.path);
    const operation: Record<string, unknown> = {
      summary: route.summary,
      security: [{ bearerAuth: [] }],
    };
    if (route.params) {
      operation.parameters = Object.entries(route.params.shape).map(([name, schema]) => ({
        name,
        in: "path",
        required: true,
        schema: convert(schema as z.ZodType, "output", registry, schemas),
      }));
    }
    if (route.body) {
      operation.requestBody = {
        required: true,
        content: jsonContent(convert(route.body, "input", registry, schemas)),
      };
    }
    const responses: Record<string, unknown> = {
      [route.success.status]: {
        description: route.success.description,
        content: jsonContent(convert(route.success.schema, "output", registry, schemas)),
      },
    };
    for (const [status, description] of Object.entries(route.errors)) {
      responses[status] = { description, content: jsonContent(errorRef) };
    }
    operation.responses = responses;
    paths[path] = { ...paths[path], [route.method]: operation };
  }
  return { paths, schemas };
}
