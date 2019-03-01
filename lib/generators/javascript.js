// Jovi's JavaScript code generator.
// It generates JavaScript code from a Rockstar AST.

const prettier = require("prettier")

/**
 * Generates JavaScript code from the given AST.
 */
function generate(ast) {
  let code = generateStatements(ast.root, 0)

  // if we need to accept input from stdin, and don't want to introduce 3rd-party dependencies to do so,
  // we need to wrap the generated code in an async function so we can use readline; only do so if needed
  if (helpersNeeded.has("_readInput")) {
    code = `(async function() {\n\n${code}\n})();\n`
  }

  if (helpersNeeded.size) {
    Array.from(helpersNeeded).sort().forEach((helperName) => {
      const helperFn = helpers[helperName]
      code += `\n${helperFn}`
    })
  }

  if (prettier) code = prettier.format(code, { parser: "babel" })
  return code
}

/**
 * Returns the preferred extension for JavaScript files.
 * A leading dot is included.
 */
function extension() {
  return ".js"
}

// ------------------------- Internal Implementation -------------------------

const INDENT_STR = "\t"
const BLOCKS = ["if", "else if", "else", "while", "function"]

/**
 * Cleans a Rockstar variable name for use in JavaScript.
 *
 * I wanted to make the JS variable names idiomatic by removing spaces and transforming to camelCase, but:
 * 1. You can't lowercase the first character of proper variables, or they may clash
 *    with similarly-named common variables, e.g. "my world" and "MyWorld" (both myWorld in JS).
 * 2. You can't remove spaces or similarly-named proper variables may clash,
 *    e.g. "Doctor Feel Good" and "Doctor FeelGood" (both doctorFeelGood or DoctorFeelGood in JS).
 *
 * So eh, now I just replace spaces with underscores and call it good enough.
 * Maybe someday I could implement collision detection with variable names and munge?
 */
function cleanVariableName(variableName) {
  return variableName.replace(/\s+/g, "_")
}

/**
 * Generates a JavaScript expression representing the given `expression` AST node.
 */
function generateExpression(expNode) {
  // !!! what if variables referenced in the expression aren't already declared?

  // generates JS representing a whole or partial expression, calling itself recursively as needed
  function generate(astNode) {
    if (astNode.op === "operand") {
      if (astNode.fn && astNode.args) {
        return generateFunctionCall(astNode)
      }
      else if (astNode.var || astNode.literalType) {
        return generateVariableOrLiteral(astNode)
      }
      else {
        const err = new Error(`Didn't find expected function call, variable or literal in expression's '${astNode.op}' node`)
        err.astNode = astNode
        throw err
      }
    }

    if (astNode.op === "boolean") {
      // use JS's own boolean operators, for short-circuiting
      const operator = (astNode.operator === "and") ? "&&" : "||"
      return `${generate(astNode.left)} ${operator} ${generate(astNode.right)}`
    }
    else if (astNode.op === "math" || astNode.op === "compare") {
      // implement as function call so we can adjust data types and handle Rockstar's operator rules properly
      const helper = operatorHelpers[astNode.operator]
      helpersNeeded.add(helper)
      return `${helper}(${generate(astNode.left)}, ${generate(astNode.right)})`
    }
    else {
      const err = new Error(`Invalid '${astNode.op}' node in expression`)
      err.astNode = astNode
      throw err
    }
  }

  return generate(expNode.tree)
}

/**
 * Generates a JavaScript function call from the given AST node's `fn` and `args` properties.
 * No trailing semicolon or newline is included.
 */
function generateFunctionCall(astNode) {
  // { op: "call", fn: functionName, args }
  // { op: "arg", var: variableName, literalType, literalValue }

  let args = ""
  astNode.args.forEach((arg) => {
    if (args) args += ", "
    args += generateVariableOrLiteral(arg)  // !!! what if a variable passed as an arg hasn't been declared?
  })

  const functionName = cleanVariableName(astNode.fn)
  return `${functionName}(${args})`  // no semicolon or newline, for use in an expression
}

/**
 * Generates a JavaScript variable name, number/string/type literal, or function call
 * from the given AST node's fn/args, var, or literalType/literalValue properties.
 */
function generateVariableOrLiteral(astNode) {
  if (astNode.var) return cleanVariableName(astNode.var)
  return (astNode.literalType === "string") ? `"${astNode.literalValue}"` : astNode.literalValue
}

/**
 * Recursively generates the JavaScript statements which represent the given AST node and its children,
 * outputting code indented to the given level.
 */
function generateStatements(astNode, indentLevel) {
  if (!astNode.children || !astNode.children.length) return ""
  let code = ""

  astNode.children.forEach((node) => {
    const generatorFn = generators[node.op]
    if (!generatorFn) {
      const err = new Error(`No generator implemented for op '${node.op}'`)
      err.astNode = node
      throw err
    }

    if (prettier && BLOCKS.includes(node.op)) code += "\n"
    const indent = INDENT_STR.repeat(indentLevel)

    code += indent + generatorFn(node)

    if (BLOCKS.includes(node.op)) {
      const childCode = generateStatements(node, indentLevel + 1)
      code += ` {\n${childCode}${indent}}\n`
      if (prettier) code += "\n"
    }
  })

  return code
}

/**
 * Code generators for all supported statement/AST-node types.
 * Each takes an AST node as its only argument, and returns a string containing JavaScript code.
 */
const generators = {
  "assign": (node) => {
    // { op: "assign", expression, toVar }
    // { op: "assign", expression: undefined, literalType, literalValue, toVar }

    // use `var` instead of `let` in case the variable is already declared
    // !!! how does this work with referencing variables in global scope?
    const variableName = cleanVariableName(node.toVar)

    if (node.expression) {
      const jsExpression = generateExpression(node.expression)
      return `var ${variableName} = ${jsExpression};\n`
    }
    else {
      const value = (node.literalType === "string") ? `"${node.literalValue}"` : node.literalValue
      return `var ${variableName} = ${value};\n`
    }
  },

  "increment": (node) => {
    // { op: "increment", var }
    // !!! scope? declared?
    helpersNeeded.add("_increment")
    const variableName = cleanVariableName(node.var)
    return `${variableName} = _increment(${variableName}, "${variableName}");\n`
  },
  "decrement": (node) => {
    // { op: "decrement", var }
    // !!! scope? declared?
    helpersNeeded.add("_decrement")
    const variableName = cleanVariableName(node.var)
    return `${variableName} = _decrement(${variableName}, "${variableName}");\n`
  },

  "if": (node) => {
    // { op: "if", expression }
    const jsExpression = generateExpression(node.expression)
    return `if (${jsExpression})`  // !!! need to handle Rockstar's version of truthiness
  },
  "else if": (node) => {
    // { op: "else if", expression }
    const jsExpression = generateExpression(node.expression)
    return `else if (${jsExpression})`  // !!! need to handle Rockstar's version of truthiness
  },
  "else": (node) => {
    // { op: "else" }
    return `else`
  },

  "while": (node) => {
    // { op: "while", expression, invert (boolean) }
    let jsExpression = generateExpression(node.expression)
    if (node.invert) jsExpression = ` !(${jsExpression}) `
    return `while (${jsExpression})`  // !!! need to handle Rockstar's version of truthiness
  },
  "break": (node) => {
    // { op: "break" }
    return `break;\n`
  },
  "continue": (node) => {
    // { op: "continue" }
    return `continue;\n`
  },

  "function": (node) => {
    // { op: "function", fn: functionName, args (array) }
    // { op: "arg", var: variableName, literalType: undefined, literalValue: undefined }

    let args = ""
    node.args.forEach((arg) => {
      if (args) args += ", "
      args += cleanVariableName(arg.var)
    })

    // use `var` instead of `let` in case the function is already declared as a variable
    // !!! functions and variables should have separate "namespaces"
    const functionName = cleanVariableName(node.fn)
    return `var ${functionName} = function(${args})`
  },
  "call": (node) => {
    // { op: "call", fn: functionName, args }
    // { op: "arg", var: variableName, literalType, literalValue }
    const functionCall = generateFunctionCall(node)
    return `${functionCall};\n`
  },
  "return": (node) => {
    // { op: "return", var: variableName }
    // { op: "return", var: undefined, literalType, literalValue }

    // !!! soon will be an expression
    // !!! what if the variable isn't already declared?
    const returned = generateVariableOrLiteral(node)
    return `return ${returned};\n`
  },

  "input": (node) => {
    // { op: "input", toVar: toVariableName || undefined }
    helpersNeeded.add("_readInput")

    if (!node.toVar) return `await _readInput();\n`

    const variableName = cleanVariableName(node.toVar)
    return `var ${variableName} = await _readInput();\n`
  },
  "output": (node) => {
    // { op: "output", expression }
    // !!! what if the variable isn't already declared?
    const outputted = generateExpression(node.expression)
    return `console.log(${outputted});\n`
  },
}

/**
 * Helper functions needed for the generated code to operate, based on the statements found in the program.
 * Any function named here must exist as a property of `helpers`,
 * and will be automatically included at the end of the generated code.
 */
const helpersNeeded = new Set()

/**
 * Helper functions available, i.e. which can be named in `helpersNeeded`.
 * Each of these functions is wrapped as a string to keep Istanbul from mangling them with instrumentation
 * when running tests with coverage, since there's apparently no way to turn the instrumentation off (booo).
 */
// !!! need additional type conversions here
const helpers = {
  // increment/decrement
  _increment: `function _increment(val, varName) {
    if (val === null) return 1  // convert null to 0, then increment

    const type = typeof val
    if (type === "string" || type === "undefined") {
      throw new TypeError("Can't increment " + type + ' variable "' + varName + '"')
    }

    if (type === "boolean") return !val
    return val + 1
  }`,
  _decrement: `function _decrement(val, varName) {
    if (val === null) return -1  // convert null to 0, then decrement

    const type = typeof val
    if (type === "string" || type === "undefined") {
      throw new TypeError("Can't decrement " + type + ' variable "' + varName + '"')
    }

    if (type === "boolean") return !val
    return val - 1
  }`,

  // arithmetic operators
  _add: `function _add(left, right) {
    return left + right
  }`,
  _subtract: `function _subtract(left, right) {
    return left - right
  }`,
  _multiply: `function _multiply(left, right) {
    return left * right
  }`,
  _divide: `function _divide(left, right) {
    return left / right
  }`,

  // comparison operators
  _eq: `function _eq(left, right) {
    if (left === null) left = 0
    if (right === null) right = 0
    return left === right
  }`,
  _neq: `function _neq(left, right) {
    return left !== right
  }`,
  _gt: `function _gt(left, right) {
    return left > right
  }`,
  _gte: `function _gte(left, right) {
    return left >= right
  }`,
  _lt: `function _lt(left, right) {
    return left < right
  }`,
  _lte: `function _lte(left, right) {
    return left <= right
  }`,

  // input
  // !!! convert input to number if it's all numeric
  _readInput: `function _readInput() {
    return new Promise((resolve, reject) => {
      const readline = require("readline")
      const reader = readline.createInterface({ input: process.stdin, output: process.stdout })
      reader.question("", (response) => {
        reader.close()
        resolve(response)
      })
    })
  }`,
}

/**
 * Helper functions for implementing operators, operator -> helper function name.
 * Each of the helper functions named must exist as a function in `helpers`.
 */
const operatorHelpers = {
  // arithmetic operators
  "+": "_add",
  "-": "_subtract",
  "*": "_multiply",
  "/": "_divide",

  // comparison operators
  "==": "_eq",
  "!=": "_neq",
  ">": "_gt",
  ">=": "_gte",
  "<": "_lt",
  "<=": "_lte",
}

module.exports = { generate, extension }
