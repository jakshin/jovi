// Jovi's Rockstar interpreter.
// It executes a Rockstar program, using its AST.

const readlineSync = require("readline-sync")

/**
 * Executes the Rockstar program represented by the given AST.
 */
function execute(ast) {
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
    if (node.op === "if" || ((node.op === "else if" || node.op === "else") && !lastConditionalResult)) {
      lastConditionalResult = executorFn(node)
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
    scope[node.var]++  // !!! check variable type
  },
  "decrement": (node) => {
    // { op: "decrement", var }
    const scope = currentVariableScope()
    scope[node.var]--  // !!! check variable type
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
    // !!! convert to number if it's all numeric
    const input = readlineSync.question("")

    if (node.toVar) {
      const scope = currentVariableScope()
      scope[node.toVar] = input
    }
  },
  "output": (node) => {
    // { op: "output", expression }
    console.log(evalExpression(node.expression))
  },
}

/**
 * Execution state.
 */
const state = {
  controlSignal: null,   // signal from a `continue`, `break` or `return` statement
  functions: {},         // functions' ASTs, indexed by function name
  variableScopes: [{}],  // variables, in nested scopes to handle nested function calls, with global scope as item 0
  loopDepth: 0,          // can be used to detect whether we're currently in a `while` loop
}

/**
 * Gets the current variable scope, which is either the global scope
 * or the scope of the most deeply nested function execution.
 */
function currentVariableScope() {
  return state.variableScopes[state.variableScopes.length - 1]
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
    if (astNode.op === "compare") {
      const leftVal = evalExpressionNode(astNode.left)
      const rightVal = evalExpressionNode(astNode.right)

      // !!! implement Rockstar comparison semantics
      if (astNode.operator === "==") {
        return (leftVal === null && rightVal === 0) || (leftVal === 0 && rightVal === null) || (leftVal === rightVal)
      }

      return eval(`${leftVal} ${astNode.operator} ${rightVal}`)  // yuck! ...but it's temporary
    }
    if (astNode.op === "math") {
      // !!! implement Rockstar semantics
      const leftVal = evalExpressionNode(astNode.left)
      const rightVal = evalExpressionNode(astNode.right)
      return eval(`${leftVal} ${astNode.operator} ${rightVal}`)  // yuck! ...but it's temporary
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

module.exports = { execute }
