const { TokenType } = require("../../lib/tokenType")

describe("TokenType", () => {
  it("doesn't allow properties to be added", () => {
    TokenType.FOO = "BAR"
    expect(TokenType.FOO).toBeUndefined()
  })

  it("doesn't allow properties to be deleted", () => {
    const originalDefault = TokenType.DEFAULT
    delete TokenType.DEFAULT
    expect(TokenType.DEFAULT).toBe(originalDefault)
  })

  it("doesn't allow properties' values to be changed", () => {
    const originalDefault = TokenType.DEFAULT
    TokenType.DEFAULT = "something-else"
    expect(TokenType.DEFAULT).toBe(originalDefault)
  })
})
