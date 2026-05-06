import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/users.js";


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", userRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});