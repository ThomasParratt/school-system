import express from "express";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import fs from "fs";
import YAML from 'yaml';
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/users.js";
import courseRouter from "./routes/courses.js";
import sessionRouter from "./routes/sessions.js";

const app = express();

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) &&
      (req.headers["content-length"] && req.headers["content-length"] !== "0" ||
       req.headers["transfer-encoding"]) &&
      !req.is("application/json")) {
    return res.status(400).json({
      error: { message: "Request body must use Content-Type: application/json", code: "INVALID_CONTENT_TYPE" },
    });
  }
  next();
});
app.use(express.json());
app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method) &&
      req.body !== undefined &&
      (typeof req.body !== "object" || req.body === null || Array.isArray(req.body))) {
    return res.status(400).json({
      error: { message: "Request body must be a JSON object", code: "VALIDATION_ERROR" },
    });
  }
  next();
});

const file = fs.readFileSync("./openapi.yaml", "utf8");
const swaggerDocument = YAML.parse(file);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/courses", courseRouter);
app.use("/sessions", sessionRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({
      error: { message: "Malformed JSON request body", code: "INVALID_JSON" },
    });
  }
  next(error);
});

export default app;