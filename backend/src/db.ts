import { Pool } from "pg";

export const pool = new Pool({
  user: "user",
  host: "localhost",
  database: "myapp",
  password: "password",
  port: 5432,
});