/**
 * Jovi's minimalist AST.
 *
 * Note that while this provides a nice detail-hiding facade to the parser, with runtime type/value checks,
 * the AST's internal structures are still exposed directly to the intepreter and code generators.
 */
class AST {
  /** Creates a new instance. */
  constructor() {
    this._root = { op: null, parent: null, children: [] }
    this._currentBlock = this._root
  }

  /**
   * Adds an assignment statement to the current block,
   * using an expression (which can be as simple as a variable name).
   */
  addAssignment(toVariableName, expressionTerms) {
    this._checkName(toVariableName, "addAssignment")
    this._checkExpressionTerms(expressionTerms, "addAssignment")

    expressionTerms.forEach((term) => {
      term.op = term.type
      delete term.type
    })

    const expression = { op: "expression", terms: expressionTerms }
    this._add({ op: "assign", expression, var: toVariableName })  //!!! rename var -> toVar
  }

  /**
   * Adds an assignment statement to the current block,
   * using a string, numeric, or type literal.
   */
  addAssignmentWithLiteral(toVariableName, literalType, literalValue) {
    this._checkName(toVariableName, "addAssignmentWithLiteral")
    this._checkLiteral(literalType, literalValue, "addAssignmentWithLiteral")

    this._add({ op: "assign", expression: undefined, valueType: literalType, value: literalValue, var: toVariableName })  //!!! rename var -> toVar, valueType/value
  }

  /**
   * Adds an increment or decrement statement to the current block.
   * Pass a falsy value in `increment` to add a decrement statement.
   */
  addIncrementOrDecrement(variableName, increment) {
    this._checkName(variableName, "addIncrementOrDecrement")
    this._add({ op: increment ? "increment" : "decrement", var: variableName })
  }

  /**
   * Adds an iffy statement (if, else if) to the current block, starting a new block.
   * The caller is responsible for ensuring that `else if` only follows `if` or `else if`.
   */
  addIf(expressionTerms, isElseIf) {
    this._checkExpressionTerms(expressionTerms, "addIf")

    expressionTerms.forEach((term) => {
      term.op = term.type
      delete term.type
    })

    const expression = { op: "expression", terms: expressionTerms }
    this._add({ op: isElseIf ? "else if" : "if", expression }, true)
  }

  /**
   * Adds an else statement to the current block, starting a new block.
   * The caller is responsible for ensuring that `else` only follows `if` or `else if`.
   */
  addElse() {
    this._add({ op: "else" }, true)
  }

  /**
   * Adds a loop statement (while, until) to the current block, starting a new block.
   * Pass a truthy value in `invertExpression` to handle `until`.
   */
  addLoop(expressionTerms, invertExpression) {
    this._checkExpressionTerms(expressionTerms, "addLoop")

    expressionTerms.forEach((term) => {
      term.op = term.type
      delete term.type
    })

    const expression = { op: "expression", terms: expressionTerms }
    this._add({ op: "while", expression, invert: !!invertExpression }, true)
  }

  /**
   * Adds a break statement to the current loop block.
   */
  addBreak() {
    this._checkInLoop("addBreak")
    this._add({ op: "break" })
  }

  /**
   * Adds a continue statement to the current loop block.
   */
  addContinue() {
    this._checkInLoop("addContinue")
    this._add({ op: "continue" })
  }

  /**
   * Adds a function declaration; you must do this outside any block.
   * Pass an array in `args`, empty if the function takes no arguments.
   */
  addFunctionDeclaration(functionName, args) {
    this._checkNotInAnyBlock("addFunctionDeclaration")
    this._checkName(functionName, "addFunctionDeclaration")
    this._checkFunctionArgs(args, false, "addFunctionDeclaration")

    args.forEach((arg) => { arg.op = "argument" })  // eslint-disable-line max-statements-per-line
    this._add({ op: "function", var: functionName, arguments: args }, true)  //!!! rename var -> fn
  }

  /**
   * Adds a function call to the current block.
   * Pass an array in `args`, empty if the function takes no arguments.
   */
  addFunctionCall(functionName, args) {
    this._checkName(functionName, "addFunctionCall")
    this._checkFunctionArgs(args, true, "addFunctionCall")

    args.forEach((arg) => { arg.op = "argument" })  // eslint-disable-line max-statements-per-line
    this._add({ op: "call", fn: functionName, arguments: args })
  }

  /**
   * Adds a return statement to the current function block.
   * Pass the name of the variable whose value should be returned.
   */
  addFunctionReturn(variableName) {
    if (variableName != null) this._checkName(variableName, "addFunctionReturn")
    this._checkInFunction("addFunctionReturn")

    this._add({ op: "return", var: variableName })
  }

  /**
   * Adds a return statement to the current function block.
   * Pass the string, numeric, or type literal that should be returned.
   */
  addFunctionReturnWithLiteral(literalType, literalValue) {
    this._checkLiteral(literalType, literalValue, "addFunctionReturnWithLiteral")
    this._checkInFunction("addFunctionReturnWithLiteral")

    this._add({ op: "return", var: undefined, valueType: literalType, value: literalValue })
  }

  /**
   * Adds an input statement to the current block.
   * You can pass the name of the variable that the input should be stored in (optional).
   */
  addInput(toVariableName) {
    if (toVariableName != null) this._checkName(toVariableName, "addInput")
    this._add({ op: "input", var: toVariableName || undefined })  //!!! rename var -> toVar
  }

  /**
   * Adds an output statement to the current block.
   * Pass the name of the variable whose value should be outputted.
   */
  addOutput(fromVariableName) {
    this._checkName(fromVariableName, "addOutput")
    this._add({ op: "output", var: fromVariableName })  //!!! rename var -> fromVar
  }

  /**
   * Adds an output statement to the current block.
   * Pass the string, numeric, or type literal that should be outputted.
   */
  addOutputWithLiteral(literalType, literalValue) {
    this._checkLiteral(literalType, literalValue, "addOutputWithLiteral")
    this._add({ op: "output", var: undefined, valueType: literalType, value: literalValue })  //!!! rename var -> fromVar, valueType/value
  }

  /**
   * Ends the current block.
   * Safe to call if there is no current block.
   */
  endBlock() {
    if (this._currentBlock.parent) {
      this._currentBlock = this._currentBlock.parent
    }
  }

  /**
   * Ends all blocks, like at EOF.
   */
  endAllBlocks() {
    while (this._currentBlock !== this._root) {
      this._currentBlock = this._currentBlock.parent
    }
  }

  /**
   * Is the current block an `if` or `else if` block?
   * (The `else` and `else if` statements are only valid just after one.)
   */
  currentBlockIsIf() {
    return ["if", "else if"].includes(this._currentBlock.op)
  }

  /**
   * Are we inside any block? If false, we're at the root block, i.e. global scope.
   * (Functions may only be declared at global scope.)
   */
  inAnyBlock() {
    return this._currentBlock !== this._root
  }

  /**
   * Are we somewhere inside a loop block, either as the current block or a parent of it?
   * (The `break` and `continue` statements are only valid inside a loop, or a block inside the loop.)
   */
  inLoopBlock() {
    return this._inBlock("while")
  }

  /**
   * Are we somewhere inside a function block, either as the current block or a parent of it?
   * (The `return` statement is only valid inside a function, or a block inside the function.)
   */
  inFunctionBlock() {
    return this._inBlock("function")
  }

  /**
   * Gets the AST's entire internal structure,
   * which has a root node representing the program as a whole.
   */
  get root() {
    return this._root
  }

  /**
   * Adds a node to the current block, starting a new block if appropriate.
   * @private
   */
  _add(node, isBlock = false) {
    this._currentBlock.children.push(node)

    if (isBlock) {
      if (!node.children) node.children = []
      node.parent = this._currentBlock
      this._currentBlock = node
    }
  }

  /**
   * Reports whether the current block or any of its parents are of the given type,
   * i.e. whether we're "in" a block of that type (either as the current block or not).
   * @private
   */
  _inBlock(type) {
    for (let node = this._currentBlock; node !== this._root; node = node.parent) {
      if (node.op === type) {
        return true
      }
    }

    return false
  }

  /**
   * Checks a variable or function name.
   * @private
   */
  _checkName(name, fromMethod) {
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error(`Invalid variable or function name "${name}" passed to AST's ${fromMethod}`)
    }
  }

  /**
   * Checks an expression.
   * @private
   */
  _checkExpressionTerms(expressionTerms, fromMethod) {
    if (!Array.isArray(expressionTerms)) {
      throw new Error(`Invalid non-array expression terms passed to AST's ${fromMethod} (${expressionTerms})`)
    }
    else if (expressionTerms.length === 0) {
      throw new Error(`Invalid empty array of expression terms passed to AST's ${fromMethod}`)
    }

    expressionTerms.forEach((term) => {
      if (term.type === "operand") {
        if (term.fn && term.arguments && !term.var && !term.value && !term.valueType) {
          this._checkFunctionArgs(term.arguments, true, fromMethod)
          return
        }
        else if (term.var && !term.fn && !term.arguments && !term.value && !term.valueType) {
          this._checkName(term.var, fromMethod)
          return
        }
        else if (term.valueType && !term.fn && !term.arguments && !term.var) {
          this._checkLiteral(term.valueType, term.value, fromMethod)
          return
        }
      }
      else if (term.type === "math" && "+-*/".includes(term.operator)) return
      else if (term.type === "compare" && ["==", "!=", "<", ">", "<=", ">="].includes(term.operator)) return
      else if (term.type === "boolean" && ["and", "or"].includes(term.operator)) return

      const termStr = JSON.stringify(term, null, 1).replace(/\s+/g, " ")
      throw new Error(`Invalid expression term passed to AST's ${fromMethod}: ${termStr}`)
    })
  }

  /**
   * Checks function arguments.
   * @private
   */
  _checkFunctionArgs(args, forFunctionCall, fromMethod) {
    if (!Array.isArray(args)) {
      throw new Error(`Invalid non-array args passed to AST's ${fromMethod} (${args})`)
    }

    args.forEach((arg) => {
      if (forFunctionCall) {
        // variable names and literals are valid in function calls' arguments
        if (arg.var !== undefined) {
          if (typeof arg.var !== "string" || arg.var.trim() === "") {
            throw new Error(`Invalid argument "${arg.var}" passed to AST's ${fromMethod} (invalid variable name)`)
          }
          if (arg.value !== undefined || arg.valueType !== undefined) {
            throw new Error(`Unexpected "${arg.valueType}" literal with value [${arg.value}] attached to "${arg.var}" argument in AST's ${fromMethod}`)
          }
        }
        else {
          this._checkLiteral(arg.valueType, arg.value, fromMethod)
        }
      }
      else {
        // only variable names are valid in function declarations' arguments
        if (typeof arg.var !== "string" || arg.var.trim() === "") {
          throw new Error(`Invalid argument "${arg.var}" passed to AST's ${fromMethod} (must be a variable name)`)
        }
      }
    })
  }

  /**
   * Checks a numeric, string or type literal.
   * @private
   */
  _checkLiteral(literalType, literalValue, fromMethod) {
    if (literalType === "string" && typeof literalValue === "string") return
    if (literalType === "number" && typeof literalValue === "number") return
    if (literalType === "boolean" && typeof literalValue === "boolean") return
    if (literalType === "null" && literalValue === null) return
    if (literalType === "undefined" && literalValue === undefined) return

    throw new Error(`Invalid "${literalType}" literal with value [${literalValue}] in AST's ${fromMethod}`)
  }

  /**
   * Checks that the current block is a loop block.
   * @private
   */
  _checkInLoop(fromMethod) {
    if (!this.inLoopBlock()) {
      throw new Error(`Invalid statement outside a loop in AST's ${fromMethod}`)
    }
  }

  /**
   * Checks that the current block is a function block.
   * @private
   */
  _checkInFunction(fromMethod) {
    if (!this.inFunctionBlock()) {
      throw new Error(`Invalid statement outside a function in AST's ${fromMethod}`)
    }
  }

  /**
   * Checks that there is no current block, i.e. that we're at global scope.
   * @private
   */
  _checkNotInAnyBlock(fromMethod) {
    if (this.inAnyBlock()) {
      throw new Error(`Invalid statement inside a block in AST's ${fromMethod} (must be at global scope)`)
    }
  }
}

module.exports = { AST }
