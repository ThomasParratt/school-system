import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/users.js";
import courseRouter from "./routes/courses.js";
import sessionRouter from "./routes/sessions.js";
import enrollmentRouter from "./routes/enrollments.js";


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/courses", courseRouter);
app.use("/sessions", sessionRouter);
app.use("/enrollments", enrollmentRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});