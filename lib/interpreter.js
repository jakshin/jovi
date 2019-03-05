// Jovi's Rockstar interpreter.
// It executes a Rockstar program, using its AST.

const { isNumeric, parseNumeric } = require("./utils/strings")
const { TRUE, FALSE } = require("./keywords")
const readlineSync = require("readline-sync")

/**
 * Executes the Rockstar program represented by the given AST.
 */
function execute(ast) {
  state.controlSignal = null    // signal from a `continue`, `break` or `return` statement
  state.functions = {}          // functions' ASTs, indexed by function name
  state.variableScopes = [{}]   // variables, in nested scopes to handle nested function calls, with global scope as item 0
  state.loopDepth = 0           // can be used to detect whether we're currently in a `while` loop

  // hoist functions, which must be declared as direct children of the root AST node
  ast.root.children.filter((node) => node.op === "function").forEach((node) => {
    const functionName = node.fn
    state.functions[functionName] = node
  })

  // run the program
  executeNodeChildren(ast.root)
}

// ------------------------- Internal Implementation -------------------------

/**
 * Execution state.
 * Initialized in execute(), used throughout.
 */
const state = {}

/**
 * Gets the current variable scope, which is either the global scope
 * or the scope of the most deeply nested function execution.
 */
function currentVariableScope() {
  return state.variableScopes[state.variableScopes.length - 1]
}

/**
 * Executes an AST node's children, mostly just delegating to statement-specific executor functions
 * (which can call back to this function through mutual recursion, if they are block statements),
 * but handling conditional execution of if/else-if/else sibling nodes,
 * and responding to a control signal set by any child node by halting.
 */
function executeNodeChildren(astNode) {
  if (!astNode.children) return
  let lastConditionalResult

  for (const nodeNum in astNode.children) {
    const node = astNode.children[nodeNum]
    if (node.op === "function") continue

    const executorFn = executors[node.op]
    if (!executorFn) {
      const err = new Error(`No executor implemented for op '${node.op}'`)
      err.astNode = node
      throw err
    }

    // !!! need to handle Rockstar's version of truthiness
    if (["if", "else if", "else"].includes(node.op)) {
      if (node.op === "if" || !lastConditionalResult) lastConditionalResult = executorFn(node)
    }
    else {
      executorFn(node)
    }

    if (state.controlSignal) return  // `continue`, `break` or `return` statement
  }
}

/**
 * Executor functions for all supported statement/AST-node types, called by executeNodeChildren().
 * Each takes an AST node as its only argument; most have no return value,
 * but `if` and `else if` return the evaluated value of their conditional expressions.
 */
const executors = {
  "assign": (node) => {
    // { op: "assign", expression, toVar }
    // { op: "assign", expression: undefined, literalType, literalValue, toVar }
    const scope = currentVariableScope()
    scope[node.toVar] = node.expression ? evalExpression(node.expression) : evalVariableOrLiteral(node)
  },

  "increment": (node) => {
    // { op: "increment", var }
    const scope = currentVariableScope()
    const variableType = (scope[node.var] === null) ? "null" : typeof scope[node.var]

    if (variableType === "string" || variableType === "undefined")
      throw { message: `Can't increment ${variableType} variable "${node.var}"`, runtime: true }

    if (variableType === "boolean") scope[node.var] = !scope[node.var]
    else if (variableType === "null") scope[node.var] = 1  // convert to 0, then increment
    else scope[node.var]++  // number (integer or float)
  },
  "decrement": (node) => {
    // { op: "decrement", var }
    const scope = currentVariableScope()
    const variableType = (scope[node.var] === null) ? "null" : typeof scope[node.var]

    if (variableType === "string" || variableType === "undefined")
      throw { message: `Can't decrement ${variableType} variable "${node.var}"`, runtime: true }

    if (variableType === "boolean") scope[node.var] = !scope[node.var]
    else if (variableType === "null") scope[node.var] = -1  // convert to 0, then increment
    else scope[node.var]--  // number (integer or float)
  },

  "if": (node) => {
    // { op: "if", expression }
    const result = evalExpression(node.expression)
    if (result) executeNodeChildren(node)  // !!! need to handle Rockstar's version of truthiness
    return result
  },
  "else if": (node) => {
    // { op: "else if", expression }
    const result = evalExpression(node.expression)
    if (result) executeNodeChildren(node)  // !!! need to handle Rockstar's version of truthiness
    return result
  },
  "else": (node) => {
    // { op: "else" }
    executeNodeChildren(node)
  },

  "while": (node) => {
    // { op: "while", expression, invert (boolean) }
    state.loopDepth++

    // !!! need to handle Rockstar's version of truthiness
    while ((!node.invert && evalExpression(node.expression)) || (node.invert && !evalExpression(node.expression))) {
      executeNodeChildren(node)

      if (state.controlSignal === "return") {
        break  // but don't clear controlSignal
      }
      if (state.controlSignal === "break") {
        state.controlSignal = null
        break
      }
      if (state.controlSignal === "continue") {
        state.controlSignal = null
        continue
      }
    }

    state.loopDepth--
  },
  "break": (node) => {
    // { op: "break" }
    state.controlSignal = "break"
  },
  "continue": (node) => {
    // { op: "continue" }
    state.controlSignal = "continue"
  },

  // no executor for "function"; they're just hoisted into `state.functions`,
  // and their children are executed when the function is called

  "call": (node) => {
    // { op: "call", fn: functionName, args }
    // { op: "arg", var: variableName, literalType, literalValue }

    // we won't use the function's return value here (only in an expression), so just ignore it
    callFunction(node.fn, node.args)
  },
  "return": (node) => {
    // { op: "return", var: variableName }
    // { op: "return", var: undefined, literalType, literalValue }
    const scope = currentVariableScope()
    scope._return = evalVariableOrLiteral(node)  // !!! soon will be an expression
    state.controlSignal = "return"
  },

  "input": (node) => {
    // { op: "input", toVar: toVariableName || undefined }
    let input = readlineSync.question("")

    if (isNumeric(input)) {
      const num = parseNumeric(input)
      if (!isNaN(num) && isFinite(num)) input = num
    }

    if (node.toVar) {
      const scope = currentVariableScope()
      scope[node.toVar] = input
    }
  },
  "output": (node) => {
    // { op: "output", expression }
    const result = evalExpression(node.expression)
    console.log(result === undefined ? "mysterious" : result)
  },
}

/**
 * Calls the function represented by the given AST node,
 * and returns the function's return value (if any).
 */
function callFunction(callNode) {
  // { op: "call", fn: functionName, args }
  // { op: "arg", var: variableName, literalType, literalValue }

  const functionName = callNode.fn
  const fnNode = state.functions[functionName]
  // !!! throw something if `fnNode` is undefined -- not an Error;
  // ideally we'd show the user an error like a parse error, with src line & marker -- will need `token` somehow

  // bind arguments
  // it might be nice to warn the user if counts of arguments passed and arguments accepted don't match, maybe behind a flag?
  const fnScope = {}

  fnNode.args.forEach((argNode, index) => {
    const argumentName = argNode.var
    const argumentValueNode = callNode.args[index]

    fnScope[argumentName] = argumentValueNode
      ? evalVariableOrLiteral(argumentValueNode)
      : undefined  // function call doesn't specify all arguments accepted by the function
  })

  // now we can add the function's scope to the stack, making it the current scope,
  // after binding arguments (during which we need to see the scope outside the function as current)
  state.variableScopes.push(fnScope)

  // run the function;
  // a `return` statement in it stores a value in the `_return` variable, and sets a control signal
  executeNodeChildren(fnNode)
  state.controlSignal = null

  // destroy the function's scope
  state.variableScopes.pop()
  return fnScope._return
}

/**
 * Evaluates the expression represented by the given AST node,
 * returning the value of one of the expression's operands,
 * or the result of applying one or more of its operators.
 */
function evalExpression(expNode) {
  // evaluates a whole or partial expression, calling itself recursively as needed
  function evalExpressionNode(astNode) {
    if (astNode.op === "operand") {
      if (astNode.fn && astNode.args) return callFunction(astNode)
      if (astNode.var || astNode.literalType) return evalVariableOrLiteral(astNode)

      const err = new Error(`Didn't find expected function call, variable or literal in expression's '${astNode.op}' node`)
      err.astNode = astNode
      throw err
    }

    if (astNode.operator === "and") {
      const leftVal = evalExpressionNode(astNode.left)
      if (!leftVal) return leftVal  // !!! need to handle Rockstar's version of truthiness
      return evalExpressionNode(astNode.right)
    }
    if (astNode.operator === "or") {
      const leftVal = evalExpressionNode(astNode.left)
      if (leftVal) return leftVal  // !!! need to handle Rockstar's version of truthiness
      return evalExpressionNode(astNode.right)
    }
    if (astNode.op === "compare" || astNode.op === "math") {
      const helperFn = helpers[astNode.operator]
      return helperFn(evalExpressionNode(astNode.left), evalExpressionNode(astNode.right))
    }

    const err = new Error(`Invalid '${astNode.op}' node in expression`)
    err.astNode = astNode
    throw err
  }

  return evalExpressionNode(expNode.tree)
}

/**
 * Evaluates the variable or literal in the given AST node,
 * returning the variable's value or the literal value.
 */
function evalVariableOrLiteral(astNode) {
  if (astNode.var) {
    // get variable's value from current scope
    const scope = currentVariableScope()
    return scope[astNode.var]
  }
  else if (astNode.literalType) {
    return astNode.literalValue
  }
  else {
    const err = new Error(`Didn't find expected variable or literal in '${astNode.op}'`)
    err.astNode = astNode
    throw err
  }
}

/**
 * Helper functions for evaluating expressions.
 */
const helpers = {
  // arithmetic operators

  "+": (left, right) => {
    if (isNumberish(left, right)) return left + right

    const leftType = typeof left, rightType = typeof right
    if (leftType === "string" || rightType === "string")
      return ((left === undefined) ? "mysterious" : left) + ((right === undefined) ? "mysterious" : right)

    throw { message: `Can't add ${leftType} and ${rightType}; addition requires two numbers, or a string`, runtime: true }
  },

  "-": (left, right) => {
    if (isNumberish(left, right)) return left - right
    throw { message: `Can't subtract ${typeof right} from ${typeof left}; subtraction requires two numbers`, runtime: true }
  },

  "*": (left, right) => {
    if (isNumberish(left, right)) return left * right

    const leftType = typeof left, rightType = typeof right
    if (leftType === "string" && isNumberish(right)) return repeatStr(left, right)
    if (isNumberish(left) && rightType === "string") return repeatStr(right, left)

    function repeatStr(str, count) {
      if (count < 0) throw { message: `Can't multiply/repeat a string ${count} times`, runtime: true }
      return str.repeat(count)
    }

    throw { message: `Can't multiply ${leftType} by ${rightType}; multiplication requires two numbers, or a string and number`, runtime: true }
  },

  "/": (left, right) => {
    if (right === 0 || right === null) throw { message: "Can't divide by zero", runtime: true }
    if (isNumberish(left, right)) return left / right
    throw { message: `Can't divide ${typeof left} by ${typeof right}; division requires two numbers`, runtime: true }
  },

  // comparison operators

  "==": (left, right) => {
    const leftType = typeof left, rightType = typeof right
    if (leftType === rightType) return left === right

    if (leftType === "string") return stringIsEqual(left, right, rightType)
    if (rightType === "string") return stringIsEqual(right, left, leftType)

    if (leftType === "number") return numberIsEqual(left, right, rightType)
    if (rightType === "number") return numberIsEqual(right, left, leftType)

    if (leftType === "boolean") return booleanIsEqual(left, right, rightType)
    if (rightType === "boolean") return booleanIsEqual(right, left, leftType)

    return false  // handles null-vs-mysterious
  },

  "!=": (left, right) => {
    const equalityFn = helpers["=="]
    return !equalityFn(left, right)
  },

  "<": (left, right) => {
    return !!isLess(left, right)
  },

  "<=": (left, right) => {
    const result = isLess(left, right)
    if (result == null) return false  // can't compare these types this way
    if (result) return result  // definitive result

    // fall through
    const equalityFn = helpers["=="]
    return equalityFn(left, right)
  },

  ">": (left, right) => {
    return !!isLess(right, left)
  },

  ">=": (left, right) => {
    const result = isLess(right, left)
    if (result == null) return false  // can't compare these types this way
    if (result) return result  // definitive result

    // fall through
    const equalityFn = helpers["=="]
    return equalityFn(right, left)
  },
}

/**
 * Determines whether values are all numeric-ish, i.e. numeric or null.
 * This is a helper function for our helper functions. 🙄
 */
function isNumberish(...vals) {
  for (const val of vals) {
    if (val !== null && typeof val !== "number") return false
  }
  return true
}

/**
 * Determines whether a string is equal to another value, with Rockstar comparison semantics.
 * This is a helper function for our helper functions.
 */
function stringIsEqual(str, other, otherType) {
  if (other == null) return false

  if (otherType === "boolean") {
    if (TRUE.includes(str.toLowerCase())) return other
    if (FALSE.includes(str.toLowerCase())) return !other
    return false
  }

  if (otherType === "number") {
    if (!isNumeric(str)) return false
    const num = parseNumeric(str)
    if (isNaN(num) || !isFinite(num)) return false
    return num === other
  }

  // we'll never hit this code with the current implementation of "=="; keeping it anyway for clarity/future-proofing
  return str === other
}

/**
 * Determines whether a number is equal to another value, with Rockstar comparison semantics.
 * This is a helper function for our helper functions.
 */
function numberIsEqual(num, other, otherType) {
  if (other === undefined) return false
  if (other === null) return num === 0
  if (otherType === "boolean") return !!num === other

  // we'll never hit this code with the current implementation of "=="; keeping it anyway for clarity/future-proofing
  if (otherType === "string") return stringIsEqual(other, num, "number")
  return num === other
}

/**
 * Determines whether a boolean is equal to another value, with Rockstar comparison semantics.
 * This is a helper function for our helper functions.
 */
function booleanIsEqual(bool, other, otherType) {
  if (other === undefined) return false
  if (other === null) return !bool

  // we'll never hit this code with the current implementation of "=="; keeping it anyway for clarity/future-proofing
  if (otherType === "number") return !!other === bool
  if (otherType === "string") return stringIsEqual(other, bool, "boolean")
  return bool === other
}

/**
 * Determines whether a value is less than another value, with Rockstar comparison semantics.
 * This is a helper function for our helper functions.
 */
function isLess(left, right) {
  const leftType = typeof left, rightType = typeof right
  if (leftType === rightType && leftType !== "boolean") return left < right  // booleans don't sort, per spec

  if (leftType === "string" && rightType === "number" && isNumeric(left)) return isLess(parseNumeric(left), right)
  if (rightType === "string" && leftType === "number" && isNumeric(right)) return isLess(left, parseNumeric(right))

  if (leftType === "number" && right === null) return left < 0
  if (rightType === "number" && left === null) return 0 < right  // eslint-disable-line yoda
}

module.exports = { execute }
