import { describe, expect, it } from "vitest";
import { isPublicPath } from "@/lib/routes";

describe("isPublicPath", () => {
  it.each(["/", "/how-it-works", "/auth/login", "/auth/confirm"])("lets anyone reach %s", (path) => {
    expect(isPublicPath(path)).toBe(true);
  });

  it.each(["/start", "/round/abc", "/save", "/protected", "/how-it-works-not"])(
    "needs a session for %s",
    (path) => {
      expect(isPublicPath(path)).toBe(false);
    },
  );

  it("matches a prefix only on a whole path segment, so /authority isn't public", () => {
    expect(isPublicPath("/authority")).toBe(false);
  });
});
