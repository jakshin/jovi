const { tokenize } = require("../../lib/tokenizer")

describe("tokenizer", () => {
  describe("tokenize()", () => {
    it("splits tokens on any run of whitespace", () => {
      expect(tokenize("foo bar\tbaz\n \n\nqux\rquux      quuz\n")).toMatchSnapshot()
    })

    it("parses end-all-blocks markers", () => {
      expect(tokenize("foo\n⏎\nbar\n")).toMatchSnapshot()

      // just another character inside comments and string literals
      expect(tokenize("(⏎ in comment)")).toMatchSnapshot()
      expect(tokenize('"string containing ⏎"')).toMatchSnapshot()
    })

    it("parses numeric literals", () => {
      expect(tokenize("1234567890 -1234567890 +1234567890 123. -123. +123.")).toMatchSnapshot()       // integers
      expect(tokenize(".123 -.123 +.123 0.234 -0.234 +0.234 34.56 -34.56 +34.56")).toMatchSnapshot()  // floats
      expect(tokenize("--123 123f 124e4 - + .")).toMatchSnapshot()                                    // not valid
    })

    it("handles multi-line comments correctly", () => {
      expect(tokenize("before (comment line 1\n line 2\n line 3) after")).toMatchSnapshot()
      expect(tokenize("before ( comment line 1\n ( line 2\n ( line 3\n ) after")).toMatchSnapshot()
    })

    it("handles multi-line string literals correctly", () => {
      expect(tokenize('before "string line 1\n line 2\n line 3" after')).toMatchSnapshot()
    })

    it("handles things that look like string/numeric literals inside comments correctly", () => {
      expect(tokenize('before ("comment" 123) after')).toMatchSnapshot()
    })

    it("handles things that look like comments inside string literals correctly", () => {
      expect(tokenize('before "start (parenthetical aside 123) end" after')).toMatchSnapshot()
    })

    it("handles successive string literals correctly", () => {
      expect(tokenize('"foo" ""\v"bar baz"\n"qux"')).toMatchSnapshot()
    })

    it("handles successive number literals correctly", () => {
      expect(tokenize("1 2.34\t5,678\r-9")).toMatchSnapshot()
    })

    it("treats backslashes in string literals as plain old backslashes, not escapes", () => {
      const backslash = "\\"  // we *do* need to escape backslashes in JS

      const tokens = tokenize(`before\r"some backslashes: ${backslash} ${backslash}${backslash} whee!"\tafter`)
      expect(tokens).toMatchSnapshot()

      // backslashes get serialized confusingly in the snapshot (quadrupled, so actually incorrectly, it seems?),
      // so let's validate that the string contains the expected number of them, using super-simple code
      expect(countBackslashes(tokens[1].str)).toBe(3)

      function countBackslashes(str) {
        let count = 0
        for (let i = 0; i < str.length; i++) {
          if (str[i] === backslash) count++
        }
        return count
      }
    })

    it("allows comments to begin without leading whitespace", () => {
      expect(tokenize("before(comment)after")).toMatchSnapshot()
      expect(tokenize('(foo)(bar)"baz"')).toMatchSnapshot()
    })

    it("allows string literals to begin without leading whitespace", () => {
      expect(tokenize('before"string"after')).toMatchSnapshot()
      expect(tokenize('"foo""bar"(baz)')).toMatchSnapshot()
    })

    it("doesn't allow numeric literals to begin without leading whitespace", () => {
      expect(tokenize("abc123 abc.123 abc-123 abc+123 abc-.123 abc+.123")).toMatchSnapshot()
    })

    it("ignores non-adjacent commas in numeric literals", () => {
      expect(tokenize("1,23,45")).toMatchSnapshot()   // one number
      expect(tokenize("1, 234")).toMatchSnapshot()    // two numbers
      expect(tokenize("1,,234")).toMatchSnapshot()    // not a number
      expect(tokenize("1,e10")).toMatchSnapshot()     // not a number
    })

    it("allows a single period in numeric literals", () => {
      expect(tokenize("1.234")).toMatchSnapshot()     // one number
      expect(tokenize("1. 234")).toMatchSnapshot()    // two numbers
      expect(tokenize("1..234")).toMatchSnapshot()    // not a number
      expect(tokenize("1.e10")).toMatchSnapshot()     // not a number
    })

    it("handles punctuation at the end of default tokens", () => {
      expect(tokenize("... foo?!!")).toMatchSnapshot()
      expect(tokenize("bar, baz: qux.")).toMatchSnapshot()
      expect(tokenize("foo*")).toMatchSnapshot()    // invalid trailing punctuation, don't split
      expect(tokenize(".,;:?!")).toMatchSnapshot()  // all punctuation, don't split
    })

    it("handles punctuation at the end of numeric literals", () => {
      expect(tokenize("123.,;:?!")).toMatchSnapshot()
    })

    it("handles punctuation at the end of string literals", () => {
      expect(tokenize('"yes"; "no"!')).toMatchSnapshot()
      expect(tokenize('"woot!", he "said"...')).toMatchSnapshot()
    })

    it("treats punctuation at the end of other token types as the start of the next token", () => {
      // in other words, trailing punctuation isn't valid at the end of these tokens
      expect(tokenize("(am I a comment)?")).toMatchSnapshot()
      expect(tokenize("\n!")).toMatchSnapshot()
      expect(tokenize("⏎:")).toMatchSnapshot()
      expect(tokenize("⏎\n;")).toMatchSnapshot()
    })

    it("throws a parser error if a comment never ends", () => {
      try {
        tokenize("(this comment never ends...")
        fail("Expected tokenize() to throw, but it didn't")
      }
      catch (err) {
        expect(err).toEqual({
          message: expect.stringMatching(/unterminated comment/i),
          token: expect.any(Object)
        })
      }
    })

    it("throws a parser error if a string literal never ends", () => {
      try {
        tokenize('"this string never ends...')
        fail("Expected tokenize() to throw, but it didn't")
      }
      catch (err) {
        expect(err).toEqual({
          message: expect.stringMatching(/unterminated string/i),
          token: expect.any(Object)
        })
      }
    })
  })
})
