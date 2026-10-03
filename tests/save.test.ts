import { describe, expect, it } from "vitest";
import { SaveSchema } from "@/lib/save";

describe("SaveSchema", () => {
  it("accepts a valid email with a 6-character password", () => {
    const input = { email: "guest@example.com", password: "123456" };
    expect(SaveSchema.safeParse(input).success).toBe(true);
  });

  it.each([
    ["a malformed email", { email: "guest@", password: "123456" }],
    ["a 5-character password", { email: "guest@example.com", password: "12345" }],
  ])("rejects %s", (_, input) => {
    expect(SaveSchema.safeParse(input).success).toBe(false);
  });
});
