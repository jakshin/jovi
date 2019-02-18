const { init, more, peek, peekMany, pop, popLine, rewind } = require("../../lib/tokenList")
const { TokenType } = require("../../lib/tokenType")

describe("tokenList", () => {
  const fooToken = { type: TokenType.DEFAULT, str: "foo", punctuation: ",", lineNum: 1, colNum: 1 }
  const barToken = Object.assign({}, fooToken, { str: "bar" })
  const bazToken = Object.assign({}, fooToken, { str: "baz" })

  const linebreakToken = { type: TokenType.LINEBREAK, str: "\n", punctuation: "", lineNum: 2, colNum: 2 }
  const blankLineToken = Object.assign({}, linebreakToken, { type: TokenType.BLANK_LINE })

  describe("more()", () => {
    it("returns true if there are more tokens", () => {
      init([fooToken])
      expect(more(true)).toBe(true)
      expect(more(false)).toBe(true)
    })

    it("returns false if there aren't more tokens", () => {
      init([])
      expect(more(true)).toBe(false)
      expect(more(false)).toBe(false)
    })

    it("returns true if there are more tokens past the next linebreak", () => {
      init([linebreakToken, fooToken])
      expect(more()).toBe(true)
    })

    it("returns true if there are blank-line tokens past the next linebreak", () => {
      init([linebreakToken, blankLineToken])
      expect(more()).toBe(true)
    })

    it("returns false if there are more tokens, but they're all linebreaks", () => {
      init([linebreakToken, linebreakToken, linebreakToken])
      expect(more()).toBe(false)
    })
  })

  describe("peek()", () => {
    it("returns the next token from the list", () => {
      init([fooToken, linebreakToken, blankLineToken])
      expect(peek()).toBe(fooToken)
    })

    it("doesn't remove the next token from the list", () => {
      init([fooToken, linebreakToken, blankLineToken])
      expect(peek()).toBe(fooToken)
      expect(peek()).toBe(fooToken)  // peek again to see that it's still there
    })

    it("skips linebreak tokens, if requested", () => {
      init([linebreakToken, linebreakToken, fooToken])
      expect(peek(true)).toBe(fooToken)
    })

    it("doesn't skip linebreak tokens, if not requested", () => {
      init([linebreakToken, linebreakToken, fooToken])
      expect(peek(false)).toBe(linebreakToken)
    })

    it("doesn't skip blank-line tokens", () => {
      init([blankLineToken, fooToken])
      expect(peek(false)).toBe(blankLineToken)
    })

    it("throws if there are no more tokens", () => {
      init([fooToken, linebreakToken])
      popLine()  // no more tokens left now

      try {
        peek(false)
        fail("Expected peek() to throw, but it didn't")
      }
      catch (err) {
        expect(err.message).toEqual(expect.stringMatching(/.+/))
        expect(err.token).toBe(fooToken)  // the last non-whitespace token
      }
    })

    it("throws if there are no more non-linebreak tokens, if asked to skip them", () => {
      init([fooToken, linebreakToken])
      pop()  // only the linebreak token left now

      try {
        peek(true)
        fail("Expected peek() to throw, but it didn't")
      }
      catch (err) {
        expect(err.message).toEqual(expect.stringMatching(/.+/))
        expect(err.token).toBe(fooToken)  // the last non-whitespace token
      }
    })
  })

  describe("peekMany()", () => {
    const tokensWithLinebreaks = [fooToken, linebreakToken, barToken, linebreakToken, bazToken, linebreakToken]
    const tokensWithoutLinebreaks = [fooToken, barToken, bazToken]

    it("returns the next `count` tokens from the list", () => {
      init(tokensWithoutLinebreaks)
      expect(peekMany(2)).toEqual(tokensWithoutLinebreaks.slice(0, 2))
    })

    it("returns the rest of the tokens if there are fewer than `count` left in the list", () => {
      init(tokensWithLinebreaks)
      const tooMany = tokensWithLinebreaks.length + 100
      expect(peekMany(tooMany, true)).toEqual(tokensWithoutLinebreaks)
      expect(peekMany(tooMany, false)).toEqual(tokensWithLinebreaks)
    })

    it("doesn't remove tokens from the list", () => {
      init(tokensWithoutLinebreaks)
      expect(peekMany(tokensWithoutLinebreaks.length)).toEqual(tokensWithoutLinebreaks)
      expect(peekMany(tokensWithoutLinebreaks.length)).toEqual(tokensWithoutLinebreaks)  // peek again to see that they're still there
    })

    it("skips linebreak tokens, if requested", () => {
      init(tokensWithLinebreaks)
      expect(peekMany(tokensWithoutLinebreaks.length, true)).toEqual(tokensWithoutLinebreaks)
    })

    it("doesn't skip linebreak tokens, if not requested", () => {
      init(tokensWithLinebreaks)
      expect(peekMany(tokensWithLinebreaks.length, false)).toEqual(tokensWithLinebreaks)
    })

    it("doesn't skip blank-line tokens", () => {
      init([blankLineToken, fooToken])
      expect(peekMany(1)).toEqual([blankLineToken])
    })

    it("returns an empty array if there are no more tokens", () => {
      init([])
      expect(peekMany(3, false)).toEqual([])
    })

    it("returns an empty array if there are no more non-linebreak tokens, if asked to skip them", () => {
      init([linebreakToken, linebreakToken, linebreakToken])
      expect(peekMany(2, true)).toEqual([])
    })

    it("returns an empty array if asked for zero or fewer tokens", () => {
      init(tokensWithLinebreaks)
      expect(peekMany(0, true)).toEqual([])
      expect(peekMany(0, false)).toEqual([])
      expect(peekMany(-1, true)).toEqual([])
      expect(peekMany(-1, false)).toEqual([])
    })
  })

  describe("pop()", () => {
    const stringToken = { type: TokenType.STRING_LITERAL, str: "bleh" }
    const numericToken = { type: TokenType.NUMERIC_LITERAL, str: "42" }

    it("returns the next token", () => {
      init([fooToken, barToken, linebreakToken, bazToken, linebreakToken])
      expect(pop()).toBe(fooToken)
      expect(pop()).toBe(barToken)
    })

    it("throws if there are no more tokens", () => {
      init([fooToken])
      pop()  // no more tokens left now
      expect(more()).toBe(false)  // sanity check

      try {
        pop()
        fail("Expected pop() to throw, but it didn't")
      }
      catch (err) {
        expect(err.message).toEqual(expect.stringMatching(/unexpected/i))
        expect(err.token).toBe(fooToken)  // the last non-whitespace token
      }
    })

    it("throws if the next token is a string literal, if requested", () => {
      init([stringToken, linebreakToken, blankLineToken])

      try {
        pop(true)
        fail("Expected pop() to throw, but it didn't")
      }
      catch (err) {
        expect(err.message).toEqual(expect.stringMatching(/unexpected/i))
        expect(err.token).toBe(stringToken)  // the last non-whitespace token
      }
    })

    it("throws if the next token is a numeric literal, if requested", () => {
      init([numericToken, linebreakToken, blankLineToken])

      try {
        pop(true)
        fail("Expected pop() to throw, but it didn't")
      }
      catch (err) {
        expect(err.message).toEqual(expect.stringMatching(/unexpected/i))
        expect(err.token).toBe(numericToken)  // the last non-whitespace token
      }
    })

    it("doesn't throw if the next token is a string or numeric literal, if not requested", () => {
      init([stringToken])
      expect(pop(false)).toBe(stringToken)

      init([numericToken])
      expect(pop(false)).toBe(numericToken)
    })

    it("skips linebreak tokens, if requested", () => {
      init([linebreakToken, fooToken])
      expect(pop(true, true)).toBe(fooToken)
    })

    it("doesn't skip linebreak tokens, if not requested", () => {
      init([linebreakToken, fooToken])
      expect(pop(true, false)).toBe(linebreakToken)
    })

    it("throws if there are only linebreak tokens left, and it's asked to skip them", () => {
      init([linebreakToken, linebreakToken])

      try {
        pop(true, true)
        fail("Expected pop() to throw, but it didn't")
      }
      catch (err) {
        expect(err.message).toEqual(expect.stringMatching(/unexpected/i))
        expect(err.token).toBeUndefined()  // no non-whitespace token
      }
    })
  })

  describe("popLine()", () => {
    it("returns all tokens until the next linebreak token, without the linebreak token", () => {
      init([fooToken, barToken, linebreakToken, bazToken, linebreakToken])
      expect(popLine()).toEqual([fooToken, barToken])
    })

    it("makes the current token the one just after the linebreak", () => {
      init([fooToken, barToken, linebreakToken, bazToken, linebreakToken])
      popLine()
      expect(peek(false)).toBe(bazToken)
    })

    it("returns an empty array if there are no more tokens before the next linebreak token", () => {
      init([linebreakToken, barToken, linebreakToken])
      expect(popLine()).toEqual([])
      expect(peek(false)).toBe(barToken)
    })

    it("returns all remaining tokens if there are no more linebreak tokens", () => {
      init([fooToken, barToken])
      expect(popLine()).toEqual([fooToken, barToken])
    })

    it("returns an empty array if there are no more tokens at all", () => {
      init([])
      expect(popLine()).toEqual([])
    })
  })

  describe("rewind()", () => {
    const tokens = [fooToken, linebreakToken, barToken, linebreakToken, blankLineToken, bazToken, linebreakToken]
    const tokensFromBar = tokens.slice(2)

    beforeEach(() => {
      init(tokens.slice())
      popLine()
      expect(peek(false)).toBe(barToken)  // sanity check
    })

    it("rewinds to the passed token", () => {
      const token = pop()
      pop(true)
      expect(peek()).toBe(bazToken)  // sanity check

      rewind(token)
      expect(peek()).toBe(token)
      expect(peekMany(tokens.length, false)).toEqual(tokensFromBar)
    })

    it("rewinds the whole list if needed", () => {
      while (more()) pop(true)

      rewind(fooToken)
      expect(peek()).toBe(fooToken)
      expect(peekMany(tokens.length, false)).toEqual(tokens)
    })

    it("throws if the passed token is forward in the list", () => {
      expect(peekMany(tokens.length).includes(bazToken)).toBe(true)  // sanity check

      try {
        rewind(bazToken)
        fail("Expected rewind() to throw, but it didn't")
      }
      catch (err) {
        expect(err instanceof Error).toBe(true)
        expect(err.message).toEqual(expect.stringContaining("rewind"))
      }
    })

    it("throws if the passed token was never in the list", () => {
      try {
        const token = { type: TokenType.DEFAULT, str: "quux" }
        rewind(token)
        fail("Expected rewind() to throw, but it didn't")
      }
      catch (err) {
        expect(err instanceof Error).toBe(true)
        expect(err.message).toEqual(expect.stringContaining("rewind"))
      }
    })
  })
})
