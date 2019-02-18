// Jovi's Rockstar interpreter.
// It executes a Rockstar program, using its AST.

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

    if (node.op === "if" || ((node.op === "else if" || node.op === "else") && !lastConditionalResult)) {
      lastConditionalResult = executorFn()
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
    if (result) executeNodeChildren(node)
    return result
  },
  "else if": (node) => {
    // { op: "else if", expression }
    const result = evalExpression(node.expression)
    if (result) executeNodeChildren(node)
    return result
  },
  "else": (node) => {
    // { op: "else" }
    executeNodeChildren(node)
  },

  "while": (node) => {
    // { op: "while", expression, invert (boolean) }
    state.loopDepth++

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
    // !!!
  },
  "output": (node) => {
    // { op: "output", var: variableName }
    // { op: "output", var: undefined, literalType, literalValue }
    console.log(evalVariableOrLiteral(node))
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
  state.variableScopes.push(fnScope)

  fnNode.args.forEach((argNode, index) => {
    const argumentName = argNode.var
    const argumentValueNode = callNode.args[index]

    fnScope[argumentName] = argumentValueNode
      ? evalVariableOrLiteral(argumentValueNode)
      : undefined  // function call doesn't specify all arguments accepted by the function
  })

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
 * returning the value of one of the expression's terms (operands),
 * or the result of applying one or more of its operators.
 */
function evalExpression(expNode) {
  const operands = []
  const operators = []

  for (let i = 0; i < expNode.terms.length; i++) {
    const term = expNode.terms[i]

    if (term.op === "operand") {
      operands.push(term)
      continue
    }

    while (operators.length && operators[operators.length - 1].precedence >= term.precedence) {
      const operatorNode = operators.pop()

      if (operatorNode.op === "math" || operatorNode.op === "compare") {
        // !!! expect at least 2 operands on that stack
        const operandNodeB = operands.pop()
        const operandNodeA = operands.pop()
        const result = evalMathOrComparisonOperator(operatorNode, operandNodeA, operandNodeB)
        operands.push(result) // !!! not an AST node!
      }
      else if (operatorNode.op === "and") {
        // !!!
        // we're going to evaluate everything on the left - except OR? implications?
      }
      else if (operatorNode.op === "or") {
        // !!!
        // we're going to evaluate everything on the left
      }
      else {
        // !!! throw something
      }
    }
  }

  // while (operators.length) {
  //   // !!!
  // }

  return true  // !!!
}

// !!!
function evalMathOrComparisonOperator(operatorNode, operandNodeA, operandNodeB) {
  // !!! type conversions, function calls, scope
  const a = evalVariableOrLiteral(operandNodeA)
  const b = evalVariableOrLiteral(operandNodeB)
  return eval(`${a} ${operatorNode.operator} ${b}`)
}

/**
 * Evaluates the variable or literal in the given AST node,
 * returning the variable's value or the literal value.
 */
function evalVariableOrLiteral(node) {
  if (node.var) {
    // get variable's value from current scope
    const scope = currentVariableScope()
    return scope[node.var]
  }
  else if (node.literalType) {
    return node.literalValue
  }
  else {
    const err = new Error(`Didn't find expected variable or literal in '${node.op}'`)
    err.astNode = node
    throw err
  }
}

module.exports = { execute }
