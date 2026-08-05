import request from "supertest";
import app from "../app.js";
import pool from "../database/db.js";
import { email } from "zod";

describe("Auth", () => {
    it("should reject invalid login", async () => {
        const res = await request(app)
            .post("/users/login")
            .send({
                email: "fake@test.com",
                password: "wrong"
            });

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty("error");
    });
});

describe("Register", () => {
    it("should reject invalid email", async () => {
        const res = await request(app)
        .post("/users/register")
        .send({
            name: "fakeName12345",
            email: "fake@test.com",
            password: "passworD1234"
        });
    });

    it("should reject invalid username", async () => {
        const res = await request(app)
        .post("/users/register")
        .send({ 
            name: "fakename",
            email: "fake@email.com",
            password: "passworD1234"
        });
    });

    it("should reject invalid password", async() => { 
        const res = await request(app)
        .post("/users/register")
        .send({
            name: "fakeName12345",
            email: "fake@email.com",
            password: "password"
        });
    });
});

afterAll(async () => {
    await pool.end();
});