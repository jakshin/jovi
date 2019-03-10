const AST = require("../../../lib/ast/ast")
const ArgumentList = require("../../../lib/ast/argumentList")
const Expression = require("../../../lib/ast/expression")

describe("AST", () => {
  const invalidName = ""
  const validName = "Foo"

  const invalidLiteral = ["boolean", "invalid"]
  const validLiteral = ["number", 1]

  const argumentListForDecl = new ArgumentList(false).addArgument(validName)
  const argumentListForCall = new ArgumentList(true).addArgument(validName).addArgumentWithLiteral(...validLiteral)

  const invalidExpression = {}  // anything that's not an Expression instance
  const simpleTrueExpression = new Expression().addLiteralOperand("boolean", true)
  const validExpression = new Expression()
    .addVariableOperand("Bar")
    .addArithmeticOperator("+", 20)
    .addLiteralOperand("number", 42)
    .addComparisonOperator("==", 10)
    .addFunctionCallOperand("Func1", new ArgumentList(true))
    .addBooleanOperator("and", 2)
    .addFunctionCallOperand("Func2", new ArgumentList(true).addArgument("my arg"))

  let ast

  beforeEach(() => {
    ast = new AST()
  })

  describe("addAssignment()", () => {
    it("adds an 'assign' node", () => {
      ast.addAssignment(validName, validExpression)
      expect(getOpFromLastNode(ast)).toEqual("assign")
    })

    it("rejects invalid variable names", () => {
      expect(() => ast.addAssignment(invalidName, validExpression)).toThrow("AST.addAssignment")
    })

    it("rejects invalid expressions", () => {
      expect(() => ast.addAssignment(validName, invalidExpression)).toThrow("AST.addAssignment")
    })
  })

  describe("addAssignmentWithLiteral()", () => {
    it("adds an 'assign' node", () => {
      ast.addAssignmentWithLiteral(validName, ...validLiteral)
      expect(getOpFromLastNode(ast)).toEqual("assign")

      ast = new AST()
      ast.addAssignmentWithLiteral(validName, "string", "the answer to the universe, life and everything")
      expect(getOpFromLastNode(ast)).toEqual("assign")

      ast = new AST()
      ast.addAssignmentWithLiteral(validName, "number", 42)
      expect(getOpFromLastNode(ast)).toEqual("assign")

      ast = new AST()
      ast.addAssignmentWithLiteral(validName, "boolean", false)
      expect(getOpFromLastNode(ast)).toEqual("assign")

      ast = new AST()
      ast.addAssignmentWithLiteral(validName, "null", null)
      expect(getOpFromLastNode(ast)).toEqual("assign")

      ast = new AST()
      ast.addAssignmentWithLiteral(validName, "undefined", undefined)
      expect(getOpFromLastNode(ast)).toEqual("assign")
    })

    it("rejects invalid variable names", () => {
      expect(() => ast.addAssignmentWithLiteral(invalidName, ...validLiteral)).toThrow("AST.addAssignmentWithLiteral")
    })

    it("rejects invalid literals", () => {
      expect(() => ast.addAssignmentWithLiteral(validName, ...invalidLiteral)).toThrow("AST.addAssignmentWithLiteral")
    })
  })

  describe("addIncrementOrDecrement()", () => {
    it("adds an 'increment' node", () => {
      ast.addIncrementOrDecrement(validName, 1)
      expect(getOpFromLastNode(ast)).toEqual("increment or decrement")
    })

    it("adds a 'decrement' node", () => {
      ast.addIncrementOrDecrement(validName, -1)
      expect(getOpFromLastNode(ast)).toEqual("increment or decrement")
    })

    it("handles scaled increment", () => {
      ast.addIncrementOrDecrement(validName, 42)
      expect(getLastNode(ast.root).scale).toBe(42)
    })

    it("handles scaled decrement", () => {
      ast.addIncrementOrDecrement(validName, -42)
      expect(getLastNode(ast.root).scale).toBe(-42)
    })

    it("rejects invalid variable names", () => {
      expect(() => ast.addIncrementOrDecrement(invalidName, 1)).toThrow("AST.addIncrementOrDecrement")
    })

    it("rejects invalid scales", () => {
      expect(() => ast.addIncrementOrDecrement(validName, 1.2)).toThrow("AST.addIncrementOrDecrement")
      expect(() => ast.addIncrementOrDecrement(validName, 0)).toThrow("AST.addIncrementOrDecrement")
      expect(() => ast.addIncrementOrDecrement(validName, -1.2)).toThrow("AST.addIncrementOrDecrement")
    })
  })

  describe("addIf()", () => {
    it("adds an 'if' node", () => {
      ast.addIf(validExpression, false)
      expect(getOpFromLastNode(ast)).toEqual("if")
    })

    it("adds an 'else if' node", () => {
      ast.addIf(validExpression, true)
      expect(getOpFromLastNode(ast)).toEqual("else if")
    })

    it("rejects invalid expressions", () => {
      expect(() => ast.addIf(invalidExpression, false)).toThrow("AST.addIf")
      expect(() => ast.addIf(invalidExpression, true)).toThrow("AST.addIf")
    })
  })

  describe("addElse()", () => {
    it("adds an 'else' node", () => {
      ast.addElse()
      expect(getOpFromLastNode(ast)).toEqual("else")
    })
  })

  describe("addLoop()", () => {
    it("adds a 'while' node", () => {
      ast.addLoop(validExpression, false)
      expect(getOpFromLastNode(ast)).toEqual("while")
      expect(getLastNode(ast.root).invert).toBe(false)
    })

    it("handles inverted expression ('until' loop)", () => {
      ast.addLoop(validExpression, true)
      expect(getOpFromLastNode(ast)).toEqual("while")
      expect(getLastNode(ast.root).invert).toBe(true)
    })

    it("rejects invalid expressions", () => {
      expect(() => ast.addLoop(invalidExpression, false)).toThrow("AST.addLoop")
      expect(() => ast.addLoop(invalidExpression, true)).toThrow("AST.addLoop")
    })
  })

  describe("addBreak()", () => {
    it("adds a 'break' node", () => {
      ast.addLoop(validExpression, false)
      ast.addBreak()
      expect(getOpFromLastNode(ast)).toEqual("break")
    })

    it("throws when called outside a loop", () => {
      expect(() => ast.addBreak()).toThrow("AST.addBreak")
    })
  })

  describe("addContinue()", () => {
    it("adds a 'continue' node", () => {
      ast.addLoop(validExpression, false)
      ast.addContinue()
      expect(getOpFromLastNode(ast)).toEqual("continue")
    })

    it("throws when called outside a loop", () => {
      expect(() => ast.addContinue()).toThrow("AST.addContinue")
    })
  })

  describe("addFunctionDeclaration()", () => {
    it("adds a 'function' node", () => {
      ast.addFunctionDeclaration(validName, argumentListForDecl)
      expect(getOpFromLastNode(ast)).toEqual("function")
      expect(getLastNode(ast.root).args).toEqual(expect.objectContaining(argumentListForDecl.toAST()))
    })

    it("adds a 'function' node with empty arguments", () => {
      ast.addFunctionDeclaration(validName, new ArgumentList(false))
      expect(getOpFromLastNode(ast)).toEqual("function")
      expect(getLastNode(ast.root).args).toEqual([])
    })

    it("rejects invalid function names", () => {
      expect(() => ast.addFunctionDeclaration(invalidName, argumentListForDecl)).toThrow("AST.addFunctionDeclaration")
    })

    it("rejects invalid arguments", () => {
      expect(() => ast.addFunctionDeclaration(validName, true)).toThrow("AST.addFunctionDeclaration")
      expect(() => ast.addFunctionDeclaration(validName, 42)).toThrow("AST.addFunctionDeclaration")
      expect(() => ast.addFunctionDeclaration(validName, "blah")).toThrow("AST.addFunctionDeclaration")
      expect(() => ast.addFunctionDeclaration(validName, ["bork"])).toThrow("AST.addFunctionDeclaration")
      expect(() => ast.addFunctionDeclaration(validName, { foo: "bar" })).toThrow("AST.addFunctionDeclaration")
    })

    it("throws when called inside a block", () => {
      ast.addLoop(validExpression, false)
      expect(() => ast.addFunctionDeclaration(validName, argumentListForDecl)).toThrow("AST.addFunctionDeclaration")
    })
  })

  describe("addFunctionCall()", () => {
    it("adds a 'call' node", () => {
      ast.addFunctionCall(validName, argumentListForCall)
      expect(getOpFromLastNode(ast)).toEqual("call")
      expect(getLastNode(ast.root).args).toEqual(expect.objectContaining(argumentListForCall.toAST()))
    })

    it("adds a 'call' node with empty arguments", () => {
      ast.addFunctionCall(validName, new ArgumentList(true))
      expect(getOpFromLastNode(ast)).toEqual("call")
      expect(getLastNode(ast.root).args).toEqual([])
    })

    it("rejects invalid function names", () => {
      expect(() => ast.addFunctionCall(invalidName, argumentListForCall)).toThrow("AST.addFunctionCall")
    })

    it("rejects invalid arguments", () => {
      expect(() => ast.addFunctionCall(validName, true)).toThrow("AST.addFunctionCall")
      expect(() => ast.addFunctionCall(validName, 42)).toThrow("AST.addFunctionCall")
      expect(() => ast.addFunctionCall(validName, "blah")).toThrow("AST.addFunctionCall")
      expect(() => ast.addFunctionCall(validName, ["bork"])).toThrow("AST.addFunctionCall")
      expect(() => ast.addFunctionCall(validName, { foo: "bar" })).toThrow("AST.addFunctionCall")
    })
  })

  describe("addFunctionReturn()", () => {
    it("adds a 'return' node with a variable name", () => {
      ast.addFunctionDeclaration("Func", argumentListForDecl)
      ast.addFunctionReturn()
      expect(getOpFromLastNode(ast)).toEqual("return")
      expect(getLastNode(ast.root).var).toBeUndefined()
    })

    it("adds a 'return' node with a variable name", () => {
      ast.addFunctionDeclaration("Func", argumentListForDecl)
      ast.addFunctionReturn(validName)
      expect(getOpFromLastNode(ast)).toEqual("return")
      expect(getLastNode(ast.root).var).toBe(validName)
    })

    it("rejects invalid variable names", () => {
      ast.addFunctionDeclaration("Func", argumentListForDecl)
      expect(() => ast.addFunctionReturn(invalidName)).toThrow("AST.addFunctionReturn")
    })

    it("throws when called outside a function", () => {
      expect(() => ast.addFunctionReturn(validName)).toThrow("AST.addFunctionReturn")
    })
  })

  describe("addFunctionReturnWithLiteral()", () => {
    it("adds a 'return' node", () => {
      ast.addFunctionDeclaration("Func", argumentListForDecl)
      ast.addFunctionReturnWithLiteral(...validLiteral)
      expect(getOpFromLastNode(ast)).toEqual("return")
    })

    it("throws when called outside a function", () => {
      expect(() => ast.addFunctionReturnWithLiteral(...validLiteral)).toThrow("AST.addFunctionReturnWithLiteral")
    })
  })

  describe("addInput()", () => {
    it("adds an 'input' node without a variable name", () => {
      ast.addInput()
      expect(getOpFromLastNode(ast)).toEqual("input")
      expect(getLastNode(ast.root).toVar).toBeUndefined()
    })

    it("adds an 'input' node with a variable name", () => {
      ast.addInput(validName)
      expect(getOpFromLastNode(ast)).toEqual("input")
      expect(getLastNode(ast.root).toVar).toBe(validName)
    })

    it("rejects invalid variable names", () => {
      expect(() => ast.addInput(invalidName)).toThrow("AST.addInput")
    })
  })

  describe("addOutput()", () => {
    it("adds an 'output' node", () => {
      ast.addOutput(validExpression)
      expect(getOpFromLastNode(ast)).toEqual("output")
    })

    it("rejects invalid expressions", () => {
      expect(() => ast.addOutput(invalidExpression)).toThrow("AST.addOutput")
      expect(() => ast.addOutput()).toThrow("AST.addOutput")
    })
  })

  describe("endBlock()", () => {
    it("ends the current block", () => {
      // setup
      ast.addFunctionDeclaration("Function", new ArgumentList(false))
      ast.addLoop(simpleTrueExpression, false)
      ast.addBreak()  // inside the while loop

      // test
      ast.endBlock()  // should close the while loop but not the function
      ast.addInput()  // should be in the function
      expect(ast.root).toMatchSnapshot()
    })

    it("doesn't mind if called outside any block", () => {
      ast.endBlock()
      ast.endBlock()
      ast.endBlock()
      ast.addInput()
      expect(ast.root).toMatchSnapshot()
    })
  })

  describe("endAllBlocks()", () => {
    it("ends all blocks", () => {
      // setup
      ast.addFunctionDeclaration("Function", new ArgumentList(false))
      ast.addLoop(simpleTrueExpression, false)
      ast.addBreak()  // inside the while loop

      // test
      ast.endAllBlocks()  // should close the while loop and the function
      ast.addInput()      // should be after the end of the function
      expect(ast.root).toMatchSnapshot()
    })

    it("doesn't mind if called outside any block", () => {
      ast.endAllBlocks()
      ast.endAllBlocks()
      ast.endAllBlocks()
      ast.addInput()
      expect(ast.root).toMatchSnapshot()
    })
  })

  describe("currentBlockIsIf()", () => {
    it("returns true when the current block is an 'if'", () => {
      ast.addIf(validExpression, false)
      expect(ast.currentBlockIsIf()).toBe(true)
    })

    it("returns true when the current block is an 'else if'", () => {
      ast.addIf(validExpression, true)
      expect(ast.currentBlockIsIf()).toBe(true)
    })

    it("returns false when the current block is an 'else'", () => {
      ast.addElse()
      expect(ast.currentBlockIsIf()).toBe(false)
    })

    it("returns false when the current block is something else", () => {
      ast.addLoop(validExpression, false)
      expect(ast.currentBlockIsIf()).toBe(false)
    })

    it("returns false when called outside any block", () => {
      expect(ast.currentBlockIsIf()).toBe(false)
    })
  })

  describe("inAnyBlock()", () => {
    it("returns true when called inside any block", () => {
      ast.addFunctionDeclaration(validName, argumentListForDecl)
      expect(ast.inAnyBlock()).toBe(true)

      ast.addLoop(validExpression, false)
      expect(ast.inAnyBlock()).toBe(true)

      ast.addIf(simpleTrueExpression, false)
      expect(ast.inAnyBlock()).toBe(true)

      ast.addElse()
      expect(ast.inAnyBlock()).toBe(true)
    })

    it("returns false when called outside any block", () => {
      expect(ast.inAnyBlock()).toBe(false)
    })
  })

  describe("inLoopBlock()", () => {
    it("returns true when the current block is a loop", () => {
      ast.addLoop(validExpression, false)
      expect(ast.inLoopBlock()).toBe(true)
    })

    it("returns true when the current block is something else inside a loop", () => {
      ast.addLoop(validExpression, false)
      ast.addIf(simpleTrueExpression, false)
      expect(ast.inLoopBlock()).toBe(true)
    })

    it("returns false when the current block is something else outside a loop", () => {
      ast.addIf(simpleTrueExpression, false)
      expect(ast.inLoopBlock()).toBe(false)
    })

    it("returns false when called outside any block", () => {
      expect(ast.inLoopBlock()).toBe(false)
    })
  })

  describe("inFunctionBlock()", () => {
    it("returns true when the current block is a function", () => {
      ast.addFunctionDeclaration(validName, argumentListForDecl)
      expect(ast.inFunctionBlock()).toBe(true)
    })

    it("returns true when the current block is something else inside a function", () => {
      ast.addFunctionDeclaration(validName, argumentListForDecl)
      ast.addIf(simpleTrueExpression, false)
      expect(ast.inFunctionBlock()).toBe(true)
    })

    it("returns false when the current block is something else outside a function", () => {
      ast.addIf(simpleTrueExpression, false)
      expect(ast.inFunctionBlock()).toBe(false)
    })

    it("returns false when called outside any block", () => {
      expect(ast.inFunctionBlock()).toBe(false)
    })
  })

  describe("root()", () => {
    it("returns the AST's root node", () => {
      expect(ast.root.op).toBeNull()
      expect(ast.root.parent).toBeNull()
      expect(ast.root.children).toEqual(expect.any(Array))
    })
  })
})

// gets the `op` property of the last node in the AST tree
function getOpFromLastNode(ast) {
  const lastNode = getLastNode(ast.root)
  return lastNode.op
}

// gets the last, i.e. most-recently added, node in the AST tree;
// pass it the AST's root node, it'll call itself recursively as needed
function getLastNode(astNode) {
  const childCount = astNode.children ? astNode.children.length : 0
  if (!childCount) return astNode

  const lastChild = astNode.children[childCount - 1]
  return getLastNode(lastChild)
}
