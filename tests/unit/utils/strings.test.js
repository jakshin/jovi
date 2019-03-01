const { countAlphabeticalChars, isCapitalized, isLowerCase, isWhitespace, isControl, isNumeric,
  normalizeLinebreaks, padLeft, isPunctuation, splitPunctuation } = require("../../../lib/utils/strings")

describe("strings", () => {
  describe("countAlphabeticalChars()", () => {
    it("counts English letters", () => {
      expect(countAlphabeticalChars("foo")).toBe(3)
      expect(countAlphabeticalChars("BAR")).toBe(3)
    })

    it("counts English letters with umlauts", () => {
      expect(countAlphabeticalChars("äëïöüÿÄËÏÖÜŸ")).toBe(12)
    })

    it("counts English letters with macrons", () => {
      expect(countAlphabeticalChars("āēīōūĀĒĪŌŪ")).toBe(10)
    })

    it("doesn't count non-English letters or English letters with other accents", () => {
      expect(countAlphabeticalChars("åÉîòñ 漢字 한글")).toBe(0)
    })

    it("doesn't count digits", () => {
      expect(countAlphabeticalChars("1234567890")).toBe(0)
    })

    it("doesn't count punctuation", () => {
      expect(countAlphabeticalChars("~`!@#$%^&*()-_=+[]{}|;:',.<>/?\\\"")).toBe(0)
    })

    it("doesn't count whitespace", () => {
      expect(countAlphabeticalChars(" \f\r\n\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff")).toBe(0)
    })

    it("works on a mix of characters", () => {
      expect(countAlphabeticalChars("Foo, Bar élan? BAH\n")).toBe(12)
    })

    it("works on empty strings", () => {
      expect(countAlphabeticalChars("")).toBe(0)
    })
  })

  describe("isCapitalized()", () => {
    it("returns true when the string contains only English letters, and starts with a capital letter", () => {
      ["Foo", "JSON"].forEach((str) => {
        if (!isCapitalized(str)) fail(`Expected "${str}" to be capitalized`)
      })
    })

    it("returns false when the string contains something other than English letters", () => {
      ["foo bar", "bar0", "bar?", "Élan", "élan", "\t", "-"].forEach((str) => {
        if (isCapitalized(str)) {
          const displayStr = JSON.stringify(str)
          fail(`Expected ${displayStr} not to be alphabetical`)
        }
      })
    })

    it("returns false when the string starts with a something other than a capital letter", () => {
      ["foo", " Foo", "myFoo"].forEach((str) => {
        if (isCapitalized(str)) {
          const displayStr = JSON.stringify(str)
          fail(`Expected ${displayStr} not to be capitalized`)
        }
      })
    })

    it("handles characters with umlauts", () => {
      expect(isCapitalized("äëïöüÿ")).toBe(false)
      expect(isCapitalized("ÄËÏÖÜŸ")).toBe(true)
    })

    it("handles characters with macrons", () => {
      expect(isCapitalized("āēīōū")).toBe(false)
      expect(isCapitalized("ĀĒĪŌŪ")).toBe(true)
    })

    it("returns false for an empty string", () => {
      expect(isCapitalized("")).toBe(false)
    })
  })

  describe("isLowerCase()", () => {
    it("returns true when the string contains only lowercase English letters", () => {
      ["foo", "bar"].forEach((str) => {
        if (!isLowerCase(str)) fail(`Expected "${str}" to be lowercase`)
      })
    })

    it("returns false when the string contains something other than lowercase English letters", () => {
      ["foo bar", "JSON", "myFoo", " Foo", "bar0", "bar?", "Élan", "élan", "\t", "-"].forEach((str) => {
        if (isLowerCase(str)) {
          const displayStr = JSON.stringify(str)
          fail(`Expected ${displayStr} not to be lowercase`)
        }
      })
    })

    it("handles characters with umlauts", () => {
      expect(isLowerCase("äëïöüÿ")).toBe(true)
      expect(isLowerCase("ÄËÏÖÜŸ")).toBe(false)
    })

    it("handles characters with macrons", () => {
      expect(isLowerCase("āēīōū")).toBe(true)
      expect(isLowerCase("ĀĒĪŌŪ")).toBe(false)
    })

    it("returns false for an empty string", () => {
      expect(isLowerCase("")).toBe(false)
    })
  })

  describe("isWhitespace()", () => {
    it("returns true when the string contains only whitespace", () => {
      ["\t \r\n", " ", "\t", "\r", "\n", "\u00a0\ufeff"].forEach((str, index) => {
        if (!isWhitespace(str)) {
          const displayStr = JSON.stringify(str)
          fail(`Expected ${displayStr} to be all whitespace (#${index})`)
        }
      })
    })

    it("returns false when the string contains non-whitespace", () => {
      ["a\t", "foo", "bar,", "\rbaz", " foo bar ", "EOL\n"].forEach((str, index) => {
        if (isWhitespace(str)) {
          const displayStr = JSON.stringify(str)
          fail(`Expected ${displayStr} not to be all whitespace (#${index})`)
        }
      })
    })

    it("returns false for an empty string", () => {
      expect(isWhitespace("")).toBe(false)
    })
  })

  describe("isControl()", () => {
    it("returns true when the string contains only control characters", () => {
      ["\t", "\t\r\n", "\u007f", "\u0080"].forEach((str, index) => {
        if (!isControl(str)) {
          const displayStr = JSON.stringify(str)
          fail(`Expected ${displayStr} to be all control characters (#${index})`)
        }
      })
    })

    it("returns false when the string contains non-control characters", () => {
      ["foo", " ", "foo\t", "\t\r\nbar", "\u007f!", "a\u0080"].forEach((str, index) => {
        if (isControl(str)) {
          const displayStr = JSON.stringify(str)
          fail(`Expected ${displayStr} not to be all control characters (#${index})`)
        }
      })
    })

    it("returns false for an empty string", () => {
      expect(isControl("")).toBe(false)
    })
  })

  describe("isNumeric()", () => {
    it("returns true when the string is numeric", () => {
      const strs = ["1234567890", "-1234567890", "+1234567890", "123.", "-123.", "+123.", "0", "-0", "+0",
        ".123", "-.123", "+.123", "0.234", "-0.234", "+0.234", "34.56", "-34.56", "+34.56"]

      strs.forEach((str) => {
        if (!isNumeric(str)) fail(`Expected "${str}" to be numeric`)
      })
    })

    it("returns false when the string isn't numeric", () => {
      const strs = [null, "", "foo", "--123", "123f", "124e4", "-", "+", ".", "-.", "-+", "+.", "+-", ".-", ".+"]

      strs.forEach((str) => {
        if (isNumeric(str)) fail(`Expected "${str}" not to be numeric`)
      })
    })

    it("returns false for an empty string", () => {
      expect(isNumeric("")).toBe(false)
    })
  })

  describe("normalizeLinebreaks()", () => {
    it("converts CRLFs to LFs", () => {
      expect(normalizeLinebreaks("foo\r\nbar\r\n")).toEqual("foo\nbar\n")
    })

    it("converts CRs to LFs", () => {
      expect(normalizeLinebreaks("foo\rbar\r")).toEqual("foo\nbar\n")
    })

    it("doesn't change existing LFs", () => {
      expect(normalizeLinebreaks("foo\nbar\n")).toEqual("foo\nbar\n")
    })

    it("handles mixed CRLFs, CRs and LFs", () => {
      expect(normalizeLinebreaks("foo\r\nbar\n\rbaz\rquux\n")).toEqual("foo\nbar\n\nbaz\nquux\n")
    })

    it("ensures the string is terminated with a LF", () => {
      expect(normalizeLinebreaks("foo bar")).toEqual("foo bar\n")
    })
  })

  describe("padLeft()", () => {
    it("pads on the left with the given character", () => {
      expect(padLeft("b", 2, "a")).toBe("ab")
      expect(padLeft(".", 3, " ")).toBe("  .")
    })

    it("converts the first argument to a string if needed", () => {
      expect(padLeft(42, 4, "0")).toBe("0042")
    })

    it("doesn't pad if passed a non-positive width", () => {
      expect(padLeft("foo", 0, "x")).toBe("foo")
      expect(padLeft("bar", -1, "x")).toBe("bar")
    })

    it("doesn't pad if the string is already as wide or wider than the desired width", () => {
      expect(padLeft("foo", 3, "x")).toBe("foo")
      expect(padLeft("bar", 2, "x")).toBe("bar")
    })
  })

  describe("isPunctuation()", () => {
    it("returns true for common punctuation characters", () => {
      ".,;:?!".split("").forEach((ch) => {
        if (!isPunctuation(ch)) {
          fail(`Expected '${ch}' to be punctuation`)
        }
      })
    })

    it("returns false for other characters", () => {
      "aZ0\t `@$%()'<>/\"".split("").forEach((ch) => {
        if (isPunctuation(ch)) {
          fail(`Expected '${ch}' not to be punctuation`)
        }
      })
    })
  })

  describe("splitPunctuation()", () => {
    it("splits trailing punctuation", () => {
      expect(splitPunctuation("is that all?!")).toEqual({
        base: "is that all",
        punctuation: "?!"
      })
    })

    it("doesn't split leading or internal punctuation", () => {
      expect(splitPunctuation("; comment in ini")).toEqual({
        base: "; comment in ini",
        punctuation: ""
      })
      expect(splitPunctuation("foo: bar")).toEqual({
        base: "foo: bar",
        punctuation: ""
      })
    })

    it("handles strings without punctuation", () => {
      expect(splitPunctuation("foo")).toEqual({
        base: "foo",
        punctuation: ""
      })
    })

    it("handles strings which are all punctuaton", () => {
      expect(splitPunctuation("!?:;,.")).toEqual({
        base: "",
        punctuation: "!?:;,."
      })
    })

    it("handles empty strings", () => {
      expect(splitPunctuation("")).toEqual({
        base: "",
        punctuation: ""
      })
    })
  })
})
