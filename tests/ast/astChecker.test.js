const astChecker = require("../../lib/ast/astChecker")
const AST = require("../../lib/ast/ast")
const ArgumentList = require("../../lib/ast/argumentList")
const Expression = require("../../lib/ast/expression")

describe("astChecker", () => {
  const methodName = "Foo.barBaz"
  const argumentListForDecl = new ArgumentList(false).addArgument("my foo")
  const argumentListForCall = new ArgumentList(true).addArgument("Bar").addArgumentWithLiteral("boolean", true)

  describe("checkName", () => {
    it("accepts valid names", () => {
      astChecker.checkName("Foo")
      astChecker.checkName("really any string will do")
      expect()  // if we get here without an exception, we're good
    })

    it("rejects invalid names", () => {
      expect(() => astChecker.checkName(false, methodName)).toThrow(methodName)
      expect(() => astChecker.checkName(0, methodName)).toThrow(methodName)
      expect(() => astChecker.checkName("", methodName)).toThrow(methodName)
      expect(() => astChecker.checkName(" ", methodName)).toThrow(methodName)
      expect(() => astChecker.checkName([], methodName)).toThrow(methodName)
      expect(() => astChecker.checkName([""], methodName)).toThrow(methodName)
      expect(() => astChecker.checkName(new String("Foo"), methodName)).toThrow(methodName)  // eslint-disable-line no-new-wrappers
    })
  })

  describe("checkLiteral", () => {
    it("accepts valid literals", () => {
      astChecker.checkLiteral("string", "good", methodName)
      astChecker.checkLiteral("number", 42, methodName)
      astChecker.checkLiteral("boolean", false, methodName)
      astChecker.checkLiteral("null", null, methodName)
      astChecker.checkLiteral("undefined", undefined, methodName)
      expect()  // if we get here without an exception, we're good
    })

    it("rejects invalid literals", () => {
      expect(() => astChecker.checkLiteral("string", -1, methodName)).toThrow(methodName)
      expect(() => astChecker.checkLiteral("number", "bad", methodName)).toThrow(methodName)
      expect(() => astChecker.checkLiteral("boolean", -2, methodName)).toThrow(methodName)
      expect(() => astChecker.checkLiteral("null", undefined, methodName)).toThrow(methodName)
      expect(() => astChecker.checkLiteral("undefined", null, methodName)).toThrow(methodName)
    })
  })

  describe("checkExpression", () => {
    it("accepts valid expressions", () => {
      astChecker.checkExpression(new Expression(), methodName)
      expect()  // if we get here without an exception, we're good
    })

    it("rejects invalid expressions", () => {
      expect(() => astChecker.checkExpression(true, methodName)).toThrow(methodName)
      expect(() => astChecker.checkExpression(42, methodName)).toThrow(methodName)
      expect(() => astChecker.checkExpression("blah", methodName)).toThrow(methodName)
      expect(() => astChecker.checkExpression(["bork"], methodName)).toThrow(methodName)
      expect(() => astChecker.checkExpression({ foo: "bar" }, methodName)).toThrow(methodName)
    })
  })

  describe("checkArgumentList", () => {
    it("accepts valid argument lists for function calls", () => {
      astChecker.checkArgumentList(argumentListForCall, true, methodName)
      expect()  // if we get here without an exception, we're good
    })

    it("accepts valid argument lists for function declarations", () => {
      astChecker.checkArgumentList(argumentListForDecl, false, methodName)
      expect()  // if we get here without an exception, we're good
    })

    it("rejects argument lists which aren't valid for function declarations", () => {
      expect(() => astChecker.checkArgumentList(argumentListForCall, false, methodName)).toThrow(methodName)
    })

    it("rejects invalid argument lists", () => {
      expect(() => astChecker.checkArgumentList(true, true, methodName)).toThrow(methodName)
      expect(() => astChecker.checkArgumentList(42, true, methodName)).toThrow(methodName)
      expect(() => astChecker.checkArgumentList("blah", true, methodName)).toThrow(methodName)
      expect(() => astChecker.checkArgumentList(["bork"], true, methodName)).toThrow(methodName)
      expect(() => astChecker.checkArgumentList({ foo: "bar" }, true, methodName)).toThrow(methodName)
    })
  })

  describe("AST state checks", () => {
    let ast

    beforeEach(() => {
      ast = new AST()
    })

    describe("checkInLoop", () => {
      it("throws when not inside a loop", () => {
        expect(() => astChecker.checkInLoop(ast, methodName)).toThrow(methodName)
      })

      it("doesn't throw when inside a loop", () => {
        ast.addLoop(new Expression(), false)
        astChecker.checkInLoop(ast, methodName)
        expect()  // if we get here without an exception, we're good
      })
    })

    describe("checkInFunction", () => {
      it("throws when not inside a function", () => {
        expect(() => astChecker.checkInFunction(ast, methodName)).toThrow(methodName)
      })

      it("doesn't throw when inside a function", () => {
        ast.addFunctionDeclaration("Func", new ArgumentList(false))
        astChecker.checkInFunction(ast, methodName)
        expect()  // if we get here without an exception, we're good
      })
    })

    describe("checkNotInAnyBlock", () => {
      it("throws when in any block", () => {
        ast.addIf(new Expression(), false)
        expect(() => astChecker.checkNotInAnyBlock(ast, methodName)).toThrow(methodName)
      })

      it("doesn't throw when not in any block", () => {
        astChecker.checkNotInAnyBlock(ast, methodName)
        expect()  // if we get here without an exception, we're good
      })
    })
  })
})
