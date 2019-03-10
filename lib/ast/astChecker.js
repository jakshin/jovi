// Functions used to check the parameters passed to AST classes' methods.

/**
 * Checks a variable or function name.
 */
function checkName(name, fromMethodName) {
  if (typeof name !== "string" || name.trim() === "") {
    throw new Error(`Invalid variable or function name "${name}" passed to ${fromMethodName}`)
  }
}

/**
 * Checks a numeric, string or type literal.
 */
function checkLiteral(literalType, literalValue, fromMethodName) {
  if (literalType === "string" && typeof literalValue === "string") return
  if (literalType === "number" && typeof literalValue === "number") return
  if (literalType === "boolean" && typeof literalValue === "boolean") return
  if (literalType === "null" && literalValue === null) return
  if (literalType === "undefined" && literalValue === undefined) return

  throw new Error(`Invalid "${literalType}" literal with value [${literalValue}] passed to ${fromMethodName}`)
}

/**
 * Checks an expression.
 */
function checkExpression(expression, fromMethodName) {
  if (!expression || !expression.constructor || expression.constructor.name !== "Expression") {
    throw new Error(`Invalid expression passed to ${fromMethodName} (${typeof expression})`)
  }
}

/**
 * Checks the argument list for a function call or declaration.
 */
function checkArgumentList(argumentList, forFunctionCall, fromMethodName) {
  if (!argumentList || !argumentList.constructor || argumentList.constructor.name !== "ArgumentList") {
    throw new Error(`Invalid argument list passed to ${fromMethodName} (${typeof argumentList})`)
  }
  else if (argumentList.forFunctionCall !== forFunctionCall) {
    throw new Error(`Wrong kind of argument list passed to ${fromMethodName} (forFunctionCall = ${argumentList.forFunctionCall})`)
  }
}

/**
 * Checks that the value is an appropriate scale value for increment/decrement,
 * i.e. that it's a non-zero integer (negative or positive).
 */
function checkScale(value, fromMethodName) {
  if (!Number.isInteger(value) || value === 0) {
    throw new Error(`Invalid scale passed to ${fromMethodName} (${value})`)
  }
}

/**
 * Checks that the AST's current block is a loop block.
 */
function checkInLoop(ast, fromMethodName) {
  if (!ast.inLoopBlock()) {
    throw new Error(`Invalid statement outside a loop in ${fromMethodName}`)
  }
}

/**
 * Checks that the current block is a function block.
 */
function checkInFunction(ast, fromMethodName) {
  if (!ast.inFunctionBlock()) {
    throw new Error(`Invalid statement outside a function in ${fromMethodName}`)
  }
}

/**
 * Checks that there is no current block, i.e. that we're at global scope.
 */
function checkNotInAnyBlock(ast, fromMethodName) {
  if (ast.inAnyBlock()) {
    throw new Error(`Invalid statement inside a block in ${fromMethodName} (must be at global scope)`)
  }
}

module.exports = {
  checkName,
  checkLiteral,
  checkExpression,
  checkArgumentList,
  checkScale,
  checkInLoop,
  checkInFunction,
  checkNotInAnyBlock
}
