const ArgumentList = require("../../../lib/ast/argumentList")

describe("ArgumentList", () => {
  const argumentListForCall = new ArgumentList(true).addArgument("Baz").addArgumentWithLiteral("boolean", false)
  const argumentListForDecl = new ArgumentList(false).addArgument("Foo Bar")

  describe("forFunctionCall()", () => {
    it("returns whether the expression is for a function call", () => {
      expect(new ArgumentList(true).forFunctionCall).toBe(true)
      expect(new ArgumentList("yes").forFunctionCall).toBe(true)
      expect(new ArgumentList(false).forFunctionCall).toBe(false)
      expect(new ArgumentList(0).forFunctionCall).toBe(false)
    })
  })

  describe("addArgument", () => {
    it("rejects invalid variable names", () => {
      expect(() => new ArgumentList(true).addArgument("\t")).toThrow("ArgumentList.addArgument")
      expect(() => new ArgumentList(false).addArgument("\t")).toThrow("ArgumentList.addArgument")
    })

    it("returns the ArgumentList to allow chaining", () => {
      const argumentList = new ArgumentList()
      expect(argumentList.addArgument("Foo")).toBe(argumentList)
    })
  })

  describe("addArgumentWithLiteral", () => {
    it("rejects calls in argument lists for function declarations", () => {
      new ArgumentList(true).addArgumentWithLiteral("number", 42)  // sanity check
      expect(() => new ArgumentList(false).addArgumentWithLiteral("number", 42)).toThrow("function declaration")
    })

    it("rejects invalid literals", () => {
      expect(() => new ArgumentList(true).addArgumentWithLiteral("number", "whump")).toThrow("ArgumentList.addArgumentWithLiteral")
    })

    it("returns the ArgumentList to allow chaining", () => {
      const argumentList = new ArgumentList(true)
      expect(argumentList.addArgumentWithLiteral("number", 42)).toBe(argumentList)
    })
  })

  describe("toAST()", () => {
    it("returns an array containing AST nodes", () => {
      expect(argumentListForCall.toAST()).toMatchSnapshot()
      expect(argumentListForDecl.toAST()).toMatchSnapshot()
    })
  })
})
