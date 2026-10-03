import { describe, expect, it } from "vitest";
import { partiesToRun } from "@/scripts/lib/platforms";

describe("partiesToRun", () => {
  it("runs all three platforms without --party", () => {
    expect(partiesToRun([])).toEqual(["D", "R", "L"]);
    expect(partiesToRun(["--refresh"])).toEqual(["D", "R", "L"]);
  });

  it("runs only the platform named by --party", () => {
    expect(partiesToRun(["--party", "R"])).toEqual(["R"]);
  });

  it("throws when --party has no letter after it", () => {
    expect(() => partiesToRun(["--party"])).toThrow("--party needs D, R or L");
  });

  it("throws when a flag stands where the letter should be", () => {
    expect(() => partiesToRun(["--party", "--refresh"])).toThrow("--party needs D, R or L");
  });
});
