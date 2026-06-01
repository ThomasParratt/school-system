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

app.use(express.json());

const file = fs.readFileSync("./openapi.yaml", "utf8");
const swaggerDocument = YAML.parse(file);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/courses", courseRouter);
app.use("/sessions", sessionRouter);

export default app;