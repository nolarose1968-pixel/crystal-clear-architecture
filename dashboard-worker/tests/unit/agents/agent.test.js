import { test, expect } from "bun:test";

test("should fetch user agent from httpbin", async () => {
  const response = await fetch("https://httpbin.org/user-agent");
  expect(response.ok).toBe(true);
  
  const data = await response.json();
  expect(data).toHaveProperty("user-agent");
  expect(typeof data["user-agent"]).toBe("string");
});