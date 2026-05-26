import express from "express";
import cors from "cors";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/users.js";
import courseRouter from "./routes/courses.js";
import sessionRouter from "./routes/sessions.js";

const app = express();

app.use(express.json());

const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/courses", courseRouter);
app.use("/sessions", sessionRouter);

export default app;