const ArgumentList = require("../../../lib/ast/argumentList")
const Expression = require("../../../lib/ast/expression")

describe("Expression", () => {
  const argumentListForCall = new ArgumentList(true).addArgument("Baz").addArgumentWithLiteral("boolean", false)

  describe("addVariableOperand()", () => {
    it("rejects invalid variable names", () => {
      expect(() => new Expression().addVariableOperand("\r")).toThrow("Expression.addVariableOperand")
    })

    it("returns the Expression to allow chaining", () => {
      const expression = new Expression()
      expect(expression.addVariableOperand("Foo")).toBe(expression)
    })
  })

  describe("addLiteralOperand()", () => {
    it("rejects invalid literals", () => {
      expect(() => new Expression().addLiteralOperand("string", null)).toThrow("Expression.addLiteralOperand")
    })

    it("returns the Expression to allow chaining", () => {
      const expression = new Expression()
      expect(expression.addLiteralOperand("number", 42)).toBe(expression)
    })
  })

  describe("addFunctionCallOperand()", () => {
    it("rejects invalid function names", () => {
      expect(() => new Expression().addFunctionCallOperand("\n", argumentListForCall)).toThrow("Expression.addFunctionCallOperand")
    })

    it("rejects invalid argument lists", () => {
      expect(() => new Expression().addFunctionCallOperand("Foo")).toThrow("Expression.addFunctionCallOperand")
      expect(() => new Expression().addFunctionCallOperand("Foo", [])).toThrow("Expression.addFunctionCallOperand")
      expect(() => new Expression().addFunctionCallOperand("Foo", {})).toThrow("Expression.addFunctionCallOperand")
    })

    it("returns the Expression to allow chaining", () => {
      const expression = new Expression()
      expect(expression.addFunctionCallOperand("Foo", new ArgumentList(true))).toBe(expression)
    })
  })

  describe("addArithmeticOperator()", () => {
    it("returns the Expression to allow chaining", () => {
      const expression = new Expression()
      expect(expression.addArithmeticOperator("-", 6)).toBe(expression)
    })
  })

  describe("addComparisonOperator()", () => {
    it("returns the Expression to allow chaining", () => {
      const expression = new Expression()
      expect(expression.addComparisonOperator("!=", 4)).toBe(expression)
    })
  })

  describe("addBooleanOperator()", () => {
    it("returns the Expression to allow chaining", () => {
      const expression = new Expression()
      expect(expression.addBooleanOperator("or", 1)).toBe(expression)
    })
  })

  describe("toAST()", () => {
    it("returns an AST node containing a tree of AST nodes", () => {
      const expression = new Expression()
        .addVariableOperand("Bar")
        .addArithmeticOperator("+", 20)
        .addLiteralOperand("number", 42)
        .addComparisonOperator("==", 10)
        .addFunctionCallOperand("Func1", new ArgumentList(true))
        .addBooleanOperator("and", 2)
        .addFunctionCallOperand("Func2", new ArgumentList(true).addArgument("my arg"))
      expect(expression.toAST()).toMatchSnapshot()
    })

    it("throws an exception if an invalid expression is detected", () => {
      const expression = new Expression()  // an expression with no terms is invalid
      expect(() => expression.toAST()).toThrow("Oops")
    })
  })
})
