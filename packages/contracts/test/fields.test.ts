import { describe, expect, it } from "vitest";
import { dateTime, idParam, nonEmptyString } from "../src/index.js";

describe("idParam", () => {
  it.each([
    ["1", 1],
    ["42", 42],
  ])("accepts %s", (raw, expected) => {
    expect(idParam().parse(raw)).toBe(expected);
  });

  it.each(["0", "01", "-1", "1.5", "abc", "", "99999999999999999999"])("rejects %j", (raw) => {
    expect(idParam().safeParse(raw).success).toBe(false);
  });
});

describe("nonEmptyString", () => {
  it.each(["a", " a "])("accepts %j and keeps it as sent", (raw) => {
    expect(nonEmptyString().parse(raw)).toBe(raw);
  });

  it.each(["", "   ", 5, null])("rejects %j", (raw) => {
    expect(nonEmptyString().safeParse(raw).success).toBe(false);
  });
});

describe("dateTime", () => {
  it.each(["2026-06-01T10:00:00.000Z", "2026-06-01T10:00:00+03:00", "2026-06-01T10:00:00Z"])(
    "accepts %s",
    (raw) => {
      expect(dateTime().safeParse(raw).success).toBe(true);
    },
  );

  it.each(["not-a-date", "2026-06-01", "2026-06-01T10:00:00"])("rejects %s", (raw) => {
    expect(dateTime().safeParse(raw).success).toBe(false);
  });
});
