import express from "express";
import cors from "cors";
import userRouter from "./routes/users";


const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/users", userRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});