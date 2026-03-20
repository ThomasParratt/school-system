import { Pool } from "pg";

export const pool = new Pool({
  user: "user",
  host: "db",
  database: "myapp",
  password: "password",
  port: 5432,
});