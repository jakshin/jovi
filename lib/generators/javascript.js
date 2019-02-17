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
  if (utilitiesNeeded.has("_readInput")) {
    code = `(async function() {\n\n${code}\n})();\n`
  }

  if (utilitiesNeeded.size) {
    utilitiesNeeded.forEach((utilityName) => {
      const utilityFn = utilities[utilityName]
      code += `\n${utilityFn}`
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
 * Generates a JavaScript expression representing the given AST node's `expression` property.
 */
function generateExpression(astNode) {
  // !!! what if variables referenced in the expression aren't already declared?
  let jsExpression = ""
  const pending = {}

  astNode.expression.terms.forEach((term) => {
    // !!! if pending.operator, and not pending.operand or this isn't an operand, throw

    if (term.op === "operand") {
      const jsOperand = generateVariableOrLiteral(term)

      if (pending.operator) {
        if (jsExpression) jsExpression += " "

        if (pending.operator === "==") {
          utilitiesNeeded.add("_equals")
          jsExpression += `_equals(${pending.operand}, ${jsOperand})`
        }
        else {
          jsExpression += `${pending.operand} ${pending.operator} ${jsOperand}`
        }

        delete pending.operand
        delete pending.operator
      }
      else {
        pending.operand = jsOperand
      }
    }
    else if ((term.op === "compare" || term.op === "math") && term.operator) {
      // !!! I don't think this is correct...
      if (pending.operand) {
        pending.operator = term.operator
      }
      else {
        if (jsExpression) jsExpression += " "
        jsExpression += term.operator
      }
    }
    else if (term.op === "boolean" && (term.operator === "and" || term.operator === "or")) {
      const operator = (term.operator === "and") ? "&&" : "||"

      // !!! I don't think this is correct...
      if (pending.operand) {
        pending.operator = term.operator
      }
      else {
        if (jsExpression) jsExpression += " "
        jsExpression += operator
      }
    }
    else {
      const err = new Error(`Invalid '${term.op}' node in expression`)
      err.astNode = astNode
      throw err
    }
  })

  // !!! if pending.operator, throw
  if (pending.hasOwnProperty("operand")) {
    jsExpression += pending.operand  // the expression contained just one variable or literal
  }

  return jsExpression
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
  if (astNode.fn && astNode.args) {
    return generateFunctionCall(astNode)
  }
  else if (astNode.var) {
    return cleanVariableName(astNode.var)
  }
  else if (astNode.literalType) {
    return (astNode.literalType === "string") ? `"${astNode.literalValue}"` : astNode.literalValue
  }
  else {
    const err = new Error(`Didn't find expected function call, variable or literal in '${astNode.op}'`)
    err.astNode = astNode
    throw err
  }
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
      const jsExpression = generateExpression(node)
      return `var ${variableName} = ${jsExpression};\n`
    }
    else {
      const value = (node.literalType === "string") ? `"${node.literalValue}"` : node.literalValue
      return `var ${variableName} = ${value};\n`
    }
  },

  "increment": (node) => {
    // { op: "increment", var }
    // !!! scope? declared? conversion, e.g. `var x = null; x++` -> 0
    utilitiesNeeded.add("_increment")
    const variableName = cleanVariableName(node.var)
    return `${variableName} = _increment(${variableName});\n`
  },
  "decrement": (node) => {
    // { op: "decrement", var }
    // !!! scope? declared? conversion, e.g. `var x = null; x--` -> 0
    const variableName = cleanVariableName(node.var)
    return `${variableName}--;\n`
  },

  "if": (node) => {
    // { op: "if", expression }
    const jsExpression = generateExpression(node)
    return `if (${jsExpression})`
  },
  "else if": (node) => {
    // { op: "else if", expression }
    const jsExpression = generateExpression(node)
    return `else if (${jsExpression})`
  },
  "else": (node) => {
    // { op: "else" }
    return `else`
  },

  "while": (node) => {
    // { op: "while", expression, invert (boolean) }
    let jsExpression = generateExpression(node)
    if (node.invert) jsExpression = ` !(${jsExpression}) `
    return `while (${jsExpression})`
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
    utilitiesNeeded.add("_readInput")

    if (!node.toVar) return `await _readInput();\n`

    const variableName = cleanVariableName(node.toVar)
    return `var ${variableName} = await _readInput();\n`
  },
  "output": (node) => {
    // { op: "output", var: variableName }
    // { op: "output", var: undefined, literalType, literalValue }

    // !!! what if the variable isn't already declared?
    const outputted = generateVariableOrLiteral(node)
    return `console.log(${outputted});\n`
  },
}

/**
 * Utilities needed for the generated code to operate, based on the statements found in the program.
 * Any utility named here must exist as a property of `utilities`,
 * and will be automatically included at the end of the generated code.
 */
const utilitiesNeeded = new Set()

/**
 * Utilities available, i.e. which can be named in `utilitiesNeeded`.
 */
const utilities = {
  _readInput: function _readInput() {
    return new Promise((resolve, reject) => {
      const readline = require("readline")
      const reader = readline.createInterface({ input: process.stdin, output: process.stdout })
      reader.question("", (response) => {
        reader.close()
        resolve(response)
      })
    })
  },

  _increment: function _increment(val) {
    if (val === null) return 1  // convert null to 0, then increment
    return val + 1
  },

  _equals: function _equals(a, b) {
    if (a === null) a = 0
    if (b === null) b = 0
    return a === b
  }
}

module.exports = { generate, extension }
