const astChecker = require("./astChecker")

/**
 * Jovi's minimalist AST.
 *
 * Note that while this provides a nice detail-hiding facade to the parser, with runtime type/value checks,
 * the AST's internal structures are still exposed directly to the intepreter and code generators.
 */
class AST {
  /**
   * Creates a new instance.
   */
  constructor() {
    this._root = { op: null, parent: null, children: [] }
    this._currentBlock = this._root
  }

  /**
   * Adds an assignment statement to the current block,
   * using an expression (which can be as simple as a variable name).
   */
  addAssignment(toVariableName, expression) {
    astChecker.checkName(toVariableName, "AST.addAssignment")
    astChecker.checkExpression(expression, "AST.addAssignment")
    this._add({ op: "assign", expression: expression.toAST(), var: toVariableName })  // !!! rename var -> toVar
  }

  /**
   * Adds an assignment statement to the current block,
   * using a string, numeric, or type literal.
   */
  addAssignmentWithLiteral(toVariableName, literalType, literalValue) {
    astChecker.checkName(toVariableName, "AST.addAssignmentWithLiteral")
    astChecker.checkLiteral(literalType, literalValue, "AST.addAssignmentWithLiteral")
    this._add({ op: "assign", expression: undefined, valueType: literalType, value: literalValue, var: toVariableName })  // !!! rename var -> toVar, valueType/value
  }

  /**
   * Adds an increment or decrement statement to the current block.
   * Pass a falsy value in `increment` to add a decrement statement.
   */
  addIncrementOrDecrement(variableName, increment) {
    astChecker.checkName(variableName, "AST.addIncrementOrDecrement")
    this._add({ op: increment ? "increment" : "decrement", var: variableName })
  }

  /**
   * Adds an iffy statement (if, else if) to the current block, starting a new block.
   * The caller is responsible for ensuring that `else if` only follows `if` or `else if`.
   */
  addIf(expression, isElseIf) {
    astChecker.checkExpression(expression, "AST.addIf")
    this._add({ op: isElseIf ? "else if" : "if", expression: expression.toAST() }, true)
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
  addLoop(expression, invertExpression) {
    astChecker.checkExpression(expression, "AST.addLoop")
    this._add({ op: "while", expression: expression.toAST(), invert: !!invertExpression }, true)
  }

  /**
   * Adds a break statement to the current loop block.
   */
  addBreak() {
    astChecker.checkInLoop(this, "AST.addBreak")
    this._add({ op: "break" })
  }

  /**
   * Adds a continue statement to the current loop block.
   */
  addContinue() {
    astChecker.checkInLoop(this, "AST.addContinue")
    this._add({ op: "continue" })
  }

  /**
   * Adds a function declaration; you must do this outside any block.
   */
  addFunctionDeclaration(functionName, argumentList) {
    astChecker.checkNotInAnyBlock(this, "AST.addFunctionDeclaration")
    astChecker.checkName(functionName, "AST.addFunctionDeclaration")
    astChecker.checkArgumentList(argumentList, false, "AST.addFunctionDeclaration")
    this._add({ op: "function", var: functionName, arguments: argumentList.toAST() }, true)  // !!! rename var -> fn
  }

  /**
   * Adds a function call to the current block.
   */
  addFunctionCall(functionName, argumentList) {
    astChecker.checkName(functionName, "AST.addFunctionCall")
    astChecker.checkArgumentList(argumentList, true, "AST.addFunctionCall")
    this._add({ op: "call", fn: functionName, arguments: argumentList.toAST() })
  }

  /**
   * Adds a return statement to the current function block.
   * Pass the name of the variable whose value should be returned.
   */
  addFunctionReturn(variableName) {
    if (variableName != null) astChecker.checkName(variableName, "AST.addFunctionReturn")
    astChecker.checkInFunction(this, "AST.addFunctionReturn")
    this._add({ op: "return", var: variableName })
  }

  /**
   * Adds a return statement to the current function block.
   * Pass the string, numeric, or type literal that should be returned.
   */
  addFunctionReturnWithLiteral(literalType, literalValue) {
    astChecker.checkLiteral(literalType, literalValue, "AST.addFunctionReturnWithLiteral")
    astChecker.checkInFunction(this, "AST.addFunctionReturnWithLiteral")
    this._add({ op: "return", var: undefined, valueType: literalType, value: literalValue })
  }

  /**
   * Adds an input statement to the current block.
   * You can pass the name of the variable that the input should be stored in (optional).
   */
  addInput(toVariableName) {
    if (toVariableName != null) astChecker.checkName(toVariableName, "AST.addInput")
    this._add({ op: "input", var: toVariableName || undefined })  // !!! rename var -> toVar
  }

  /**
   * Adds an output statement to the current block.
   * Pass the name of the variable whose value should be outputted.
   */
  addOutput(fromVariableName) {
    astChecker.checkName(fromVariableName, "AST.addOutput")
    this._add({ op: "output", var: fromVariableName })  // !!! rename var -> fromVar
  }

  /**
   * Adds an output statement to the current block.
   * Pass the string, numeric, or type literal that should be outputted.
   */
  addOutputWithLiteral(literalType, literalValue) {
    astChecker.checkLiteral(literalType, literalValue, "AST.addOutputWithLiteral")
    this._add({ op: "output", var: undefined, valueType: literalType, value: literalValue })  // !!! rename var -> fromVar, valueType/value
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
}

module.exports = AST
