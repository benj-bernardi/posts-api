import request from "supertest";
import app from "../app.js";
import pool from "../database/db.js";

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

    afterAll(async () => {
        await pool.end();
    });
});