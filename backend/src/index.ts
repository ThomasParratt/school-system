import express from "express";
import cors from "cors";
import adminRouter from "./routes/admin";
import instructorsRouter from "./routes/instructors";
import studentsRouter from "./routes/students";


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/admin", adminRouter);
app.use("/instructors", instructorsRouter);
app.use("/students", studentsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});