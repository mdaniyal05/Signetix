import { describe, expect, it } from "vitest";

import { signLabel, speechLangFor } from "@/lib/psl-translations";

describe("signLabel", () => {
  it("humanizes snake_case labels in English", () => {
    expect(signLabel("thank_you", "English")).toBe("thank you");
    expect(signLabel("hello")).toBe("hello");
  });

  it("translates known words to Urdu", () => {
    expect(signLabel("thank_you", "Urdu")).toBe("شکریہ");
    expect(signLabel("hello", "Urdu")).toBe("سلام");
  });

  it("falls back to the English label for unknown words in Urdu", () => {
    expect(signLabel("some_new_sign", "Urdu")).toBe("some new sign");
  });
});

describe("speechLangFor", () => {
  it("maps languages to BCP-47 tags", () => {
    expect(speechLangFor("English")).toBe("en-US");
    expect(speechLangFor("Urdu")).toBe("ur-PK");
  });
});
