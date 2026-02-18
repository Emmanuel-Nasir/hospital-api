const request = require("supertest");
const app = require("../index"); // your express app — make sure it's exported!

describe("departments GET endpoints", () => {
  test("GET /departments - should return 200 and an array", async () => {
    const res = await request(app).get("/departments");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /departments/:id - valid ID returns 200 or 404", async () => {
    const res = await request(app).get("/departments/64f1a2b3c4d5e6f7a8b9c0d1");
    expect([200, 404]).toContain(res.statusCode);
  });

  test("GET /departments/:id - invalid ID returns 400", async () => {
    const res = await request(app).get("/departments/invalid-id");
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /departments - response should be JSON", async () => {
    const res = await request(app).get("/departments");
    expect(res.headers["content-type"]).toMatch(/json/);
  });
});