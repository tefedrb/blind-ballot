import { describe, expect, it } from "vitest";
import { countWords, extractText } from "@/scripts/lib/extract";

// An American Presidency Project page: menus and footer around one region.
const appPage = (region: string) =>
  `<html><body><nav>Menu</nav><div class="field-docs-content">${region}</div><footer>Footer</footer></body></html>`;

// An lp.org page: the platform sits between two markers.
const lpPage = (platform: string) =>
  `<html><body><nav>Menu</nav>${platform}<h3>Join Our Newsletter</h3><p>Footer</p></body></html>`;

describe("extractText for the American Presidency Project pages", () => {
  it("keeps only the .field-docs-content region, for D and for R", () => {
    expect(extractText("D", appPage("<p>Platform text.</p>"))).toBe("Platform text.");
    expect(extractText("R", appPage("<p>Platform text.</p>"))).toBe("Platform text.");
  });

  it("puts each block and each <br> on its own line", () => {
    const region = "<p>One<br>Two</p><p>Three</p><ul><li>Four</li><li>Five</li></ul>";
    expect(extractText("D", appPage(region))).toBe("One\nTwo\nThree\nFour\nFive");
  });

  it("collapses runs of spaces and keeps inline text together", () => {
    const region = "<p>  lots   of\t <b>bold</b>  spaces  </p>";
    expect(extractText("D", appPage(region))).toBe("lots of bold spaces");
  });

  it("decodes entities", () => {
    expect(extractText("D", appPage("<p>Jobs &amp; trade&nbsp;now</p>"))).toBe("Jobs & trade now");
  });

  it("drops scripts and styles", () => {
    const region = "<p>Kept.</p><script>track()</script><style>p{}</style>";
    expect(extractText("D", appPage(region))).toBe("Kept.");
  });

  it("throws unless there is exactly one region", () => {
    expect(() => extractText("D", "<html><body><p>No region</p></body></html>")).toThrow(/found 0/);
    const two = appPage("<p>A</p>") + appPage("<p>B</p>");
    expect(() => extractText("R", two)).toThrow(/found 2/);
  });
});

describe("extractText for lp.org", () => {
  it("keeps the text from PREAMBLE up to Join Our Newsletter", () => {
    const html = lpPage("<h2>PREAMBLE</h2><p>We hold.</p><script>x()</script>");
    expect(extractText("L", html)).toBe("PREAMBLE\nWe hold.");
  });

  it("throws when either marker is missing", () => {
    expect(() => extractText("L", lpPage("<p>No start marker.</p>"))).toThrow(/PREAMBLE/);
    const noEnd = "<html><body><h2>PREAMBLE</h2><p>No end marker.</p></body></html>";
    expect(() => extractText("L", noEnd)).toThrow(/Join Our Newsletter/);
  });
});

describe("a blocked page", () => {
  it("throws, even when the page has the expected region", () => {
    const blocked = appPage("<h1>Sorry, you have been blocked</h1>");
    expect(() => extractText("D", blocked)).toThrow(/blocked/);
  });
});

describe("countWords", () => {
  it("counts words separated by any whitespace", () => {
    expect(countWords("  one two\nthree  ")).toBe(3);
    expect(countWords("")).toBe(0);
  });
});
