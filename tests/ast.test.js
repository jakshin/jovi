const AST = require("../lib/ast").AST

describe("AST", () => {
  const validName = "Foo"
  const invalidName = ""

  const validLiteral = ["number", 1]
  const invalidLiteral = ["boolean", "invalid"]

  let ast, validExpression, invalidExpression, simpleTrueExpression

  beforeEach(() => {
    ast = new AST()
    validExpression = [
      { type: "operand", var: "Bar" },
      { type: "math", operator: "+" },
      { type: "operand", value: 42, valueType: "number" },
      { type: "compare", operator: "==" },
      { type: "operand", fn: "Func1", arguments: [] },
      { type: "boolean", operator: "and" },
      { type: "operand", fn: "Func2", arguments: [{ var: "my arg" }] }
    ]
    invalidExpression = [{ type: "operand", var: "Foo", fn: "Bar" }]
    simpleTrueExpression = [{ type: "operand", value: true, valueType: "boolean" }]
  })

  describe("addAssignment()", () => {
    it("adds an 'assign' node", () => {
      ast.addAssignment(validName, validExpression)
      expect(getOpFromLastNode(ast)).toEqual("assign")
    })

    it("rejects invalid variable names", () => {
      expect(() => ast.addAssignment(invalidName, ...validExpression)).toThrow("addAssignment")

      expect(() => ast.addAssignment(false, ...validExpression)).toThrow("addAssignment")
      expect(() => ast.addAssignment(0, ...validExpression)).toThrow("addAssignment")
      expect(() => ast.addAssignment("", ...validExpression)).toThrow("addAssignment")
      expect(() => ast.addAssignment(" ", ...validExpression)).toThrow("addAssignment")
      expect(() => ast.addAssignment([], ...validExpression)).toThrow("addAssignment")
      expect(() => ast.addAssignment([""], ...validExpression)).toThrow("addAssignment")
      expect(() => ast.addAssignment(new String("Foo"), ...validExpression)).toThrow("addAssignment")  // eslint-disable-line no-new-wrappers
    })

    it("rejects invalid expressions", () => {
      expect(() => ast.addAssignment(validName, invalidExpression)).toThrow("addAssignment")

      expect(() => ast.addAssignment(validName, [])).toThrow("addAssignment")
      expect(() => ast.addAssignment(validName, false)).toThrow("addAssignment")
      expect(() => ast.addAssignment(validName, 0)).toThrow("addAssignment")
      expect(() => ast.addAssignment(validName, "")).toThrow("addAssignment")
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
      expect(() => ast.addAssignmentWithLiteral(invalidName, ...validLiteral)).toThrow("addAssignmentWithLiteral")
    })

    it("rejects invalid literals", () => {
      expect(() => ast.addAssignmentWithLiteral(validName, ...invalidLiteral)).toThrow("addAssignmentWithLiteral")

      expect(() => ast.addAssignmentWithLiteral(validName, "string", -1)).toThrow("addAssignmentWithLiteral")
      expect(() => ast.addAssignmentWithLiteral(validName, "number", "bad")).toThrow("addAssignmentWithLiteral")
      expect(() => ast.addAssignmentWithLiteral(validName, "boolean", -1)).toThrow("addAssignmentWithLiteral")
      expect(() => ast.addAssignmentWithLiteral(validName, "null", -1)).toThrow("addAssignmentWithLiteral")
      expect(() => ast.addAssignmentWithLiteral(validName, "undefined", -1)).toThrow("addAssignmentWithLiteral")
    })
  })

  describe("addIncrementOrDecrement()", () => {
    it("adds an 'increment' node", () => {
      ast.addIncrementOrDecrement(validName, true)
      expect(getOpFromLastNode(ast)).toEqual("increment")
    })

    it("adds a 'decrement' node", () => {
      ast.addIncrementOrDecrement(validName, false)
      expect(getOpFromLastNode(ast)).toEqual("decrement")
    })

    it("rejects invalid variable names", () => {
      expect(() => ast.addIncrementOrDecrement(invalidName, true)).toThrow("addIncrementOrDecrement")
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
      expect(() => ast.addIf(invalidExpression, false)).toThrow("addIf")
      expect(() => ast.addIf(invalidExpression, true)).toThrow("addIf")
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
      expect(() => ast.addLoop(invalidExpression, false)).toThrow("addLoop")
      expect(() => ast.addLoop(invalidExpression, true)).toThrow("addLoop")
    })
  })

  describe("addBreak()", () => {
    it("adds a 'break' node", () => {
      ast.addLoop(validExpression, false)
      ast.addBreak()
      expect(getOpFromLastNode(ast)).toEqual("break")
    })

    it("throws when called outside a loop", () => {
      expect(() => ast.addBreak()).toThrow("addBreak")
    })
  })

  describe("addContinue()", () => {
    it("adds a 'continue' node", () => {
      ast.addLoop(validExpression, false)
      ast.addContinue()
      expect(getOpFromLastNode(ast)).toEqual("continue")
    })

    it("throws when called outside a loop", () => {
      expect(() => ast.addContinue()).toThrow("addContinue")
    })
  })

  describe("addFunctionDeclaration()", () => {
    it("adds a 'function' node", () => {
      const args = [{ var: validName }]
      ast.addFunctionDeclaration(validName, args)
      expect(getOpFromLastNode(ast)).toEqual("function")
      expect(getLastNode(ast.root).arguments).toEqual(expect.objectContaining(args))
    })

    it("adds a 'function' node with empty arguments", () => {
      ast.addFunctionDeclaration(validName, [])
      expect(getOpFromLastNode(ast)).toEqual("function")
      expect(getLastNode(ast.root).arguments).toEqual([])
    })

    it("rejects invalid function names", () => {
      expect(() => ast.addFunctionDeclaration(invalidName, [])).toThrow("addFunctionDeclaration")
    })

    it("rejects invalid arguments", () => {
      expect(() => ast.addFunctionDeclaration(validName, false)).toThrow("addFunctionDeclaration")
      expect(() => ast.addFunctionDeclaration(validName, 0)).toThrow("addFunctionDeclaration")
      expect(() => ast.addFunctionDeclaration(validName, "")).toThrow("addFunctionDeclaration")
      expect(() => ast.addFunctionDeclaration(validName, [{ var: 42 }])).toThrow("addFunctionDeclaration")
      expect(() => ast.addFunctionDeclaration(validName, [{ var: "\t" }])).toThrow("addFunctionDeclaration")
      expect(() => ast.addFunctionDeclaration(validName, [{ value: "x", valueType: "boolean" }])).toThrow("addFunctionDeclaration")
    })

    it("throws when called inside a block", () => {
      ast.addLoop(validExpression, false)
      expect(() => ast.addFunctionDeclaration(validName, [])).toThrow("addFunctionDeclaration")
    })
  })

  describe("addFunctionCall()", () => {
    it("adds a 'call' node", () => {
      const args = [{ var: validName }, { value: 42, valueType: "number" }]
      ast.addFunctionCall(validName, args)
      expect(getOpFromLastNode(ast)).toEqual("call")
      expect(getLastNode(ast.root).arguments).toEqual(expect.objectContaining(args))
    })

    it("adds a 'call' node with empty arguments", () => {
      ast.addFunctionCall(validName, [])
      expect(getOpFromLastNode(ast)).toEqual("call")
      expect(getLastNode(ast.root).arguments).toEqual([])
    })

    it("rejects invalid function names", () => {
      expect(() => ast.addFunctionCall(invalidName, [])).toThrow("addFunctionCall")
    })

    it("rejects invalid arguments", () => {
      expect(() => ast.addFunctionCall(validName, false)).toThrow("addFunctionCall")
      expect(() => ast.addFunctionCall(validName, 0)).toThrow("addFunctionCall")
      expect(() => ast.addFunctionCall(validName, "")).toThrow("addFunctionCall")
      expect(() => ast.addFunctionCall(validName, [{ var: 42 }])).toThrow("addFunctionCall")
      expect(() => ast.addFunctionCall(validName, [{ var: "\t" }])).toThrow("addFunctionCall")
      expect(() => ast.addFunctionCall(validName, [{ value: "x", valueType: "boolean" }])).toThrow("addFunctionCall")
      expect(() => ast.addFunctionCall(validName, [{ var: validName, value: "x" }])).toThrow("addFunctionCall")
      expect(() => ast.addFunctionCall(validName, [{ var: validName, valueType: "string" }])).toThrow("addFunctionCall")
    })
  })

  describe("addFunctionReturn()", () => {
    it("adds a 'return' node with a variable name", () => {
      ast.addFunctionDeclaration("Func", [])
      ast.addFunctionReturn()
      expect(getOpFromLastNode(ast)).toEqual("return")
      expect(getLastNode(ast.root).var).toBeUndefined()
    })

    it("adds a 'return' node with a variable name", () => {
      ast.addFunctionDeclaration("Func", [])
      ast.addFunctionReturn(validName)
      expect(getOpFromLastNode(ast)).toEqual("return")
      expect(getLastNode(ast.root).var).toBe(validName)
    })

    it("rejects invalid variable names", () => {
      ast.addFunctionDeclaration("Func", [])
      expect(() => ast.addFunctionReturn(invalidName)).toThrow("addFunctionReturn")
    })

    it("throws when called outside a function", () => {
      expect(() => ast.addFunctionReturn(validName)).toThrow("addFunctionReturn")
    })
  })

  describe("addFunctionReturnWithLiteral()", () => {
    it("adds a 'return' node", () => {
      ast.addFunctionDeclaration("Func", [])
      ast.addFunctionReturnWithLiteral(...validLiteral)
      expect(getOpFromLastNode(ast)).toEqual("return")
    })

    it("throws when called outside a function", () => {
      expect(() => ast.addFunctionReturnWithLiteral(...validLiteral)).toThrow("addFunctionReturnWithLiteral")
    })
  })

  describe("addInput()", () => {
    it("adds an 'input' node without a variable name", () => {
      ast.addInput()
      expect(getOpFromLastNode(ast)).toEqual("input")
      expect(getLastNode(ast.root).var).toBeUndefined()
    })

    it("adds an 'input' node with a variable name", () => {
      ast.addInput(validName)
      expect(getOpFromLastNode(ast)).toEqual("input")
      expect(getLastNode(ast.root).var).toBe(validName)
    })

    it("rejects invalid variable names", () => {
      expect(() => ast.addInput(invalidName)).toThrow("addInput")
    })
  })

  describe("addOutput()", () => {
    it("adds an 'output' node", () => {
      ast.addOutput(validName)
      expect(getOpFromLastNode(ast)).toEqual("output")
    })

    it("rejects invalid variable names", () => {
      expect(() => ast.addOutput(invalidName)).toThrow("addOutput")
      expect(() => ast.addOutput()).toThrow("addOutput")
    })
  })

  describe("addOutputWithLiteral()", () => {
    it("adds an 'output' node", () => {
      ast.addOutputWithLiteral(...validLiteral)
      expect(getOpFromLastNode(ast)).toEqual("output")
    })

    it("rejects invalid literals", () => {
      expect(() => ast.addOutputWithLiteral(...invalidLiteral)).toThrow("addOutputWithLiteral")
    })
  })

  describe("endBlock()", () => {
    it("ends the current block", () => {
      // setup
      ast.addFunctionDeclaration("Function", [])
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
      ast.addFunctionDeclaration("Function", [])
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
      ast.addFunctionDeclaration(validName, [])
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
      ast.addFunctionDeclaration(validName, [])
      expect(ast.inFunctionBlock()).toBe(true)
    })

    it("returns true when the current block is something else inside a function", () => {
      ast.addFunctionDeclaration(validName, [])
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
