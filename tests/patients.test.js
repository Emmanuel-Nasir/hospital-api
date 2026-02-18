const request = require("supertest");
const app = require("../index"); // your express app — make sure it's exported!

describe("patients GET endpoints", () => {
  test("GET /patients - should return 200 and an array", async () => {
    const res = await request(app).get("/patients");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /patients/:id - valid ID returns 200 or 404", async () => {
    const res = await request(app).get("/patients/64f1a2b3c4d5e6f7a8b9c0d1");
    expect([200, 404]).toContain(res.statusCode);
  });

  test("GET /patients/:id - invalid ID returns 400", async () => {
    const res = await request(app).get("/patients/invalid-id");
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /patients - response should be JSON", async () => {
    const res = await request(app).get("/patients");
    expect(res.headers["content-type"]).toMatch(/json/);
  });
});