import request from "supertest";
import app from "../../../src/app.js";
import { createUser } from '../factories/userFactory.js';

export async function loginAsInstructor() {
  const user = await createUser({
    role: "instructor",
  });

  const response = await request(app)
    .post("/auth/login")
    .send({
      email: user.email,
      password: "password",
    });

  return response.body.data.token;
}