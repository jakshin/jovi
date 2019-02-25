const astChecker = require("./astChecker")

/**
 * An expression builder.
 */
class Expression {
  /**
   * Creates a new instance.
   */
  constructor() {
    this._terms = []
  }

  /**
   * Adds an operand representing a variable.
   */
  addVariableOperand(variableName) {
    astChecker.checkName(variableName, "Expression.addVariableOperand")
    this._terms.push({ op: "operand", var: variableName })  // undefined: fn, args, literalType, literalValue
    return this
  }

  /**
   * Adds an operand representing a string, numeric, or type literal.
   */
  addLiteralOperand(literalType, literalValue) {
    astChecker.checkLiteral(literalType, literalValue, "Expression.addLiteralOperand")
    this._terms.push({ op: "operand", literalType, literalValue })  // undefined: fn, args, var
    return this
  }

  /**
   * Adds an operand representing a function call, along with its arguments.
   */
  addFunctionCallOperand(functionName, argumentList) {
    astChecker.checkName(functionName, "Expression.addFunctionCallOperand")
    astChecker.checkArgumentList(argumentList, true, "Expression.addFunctionCallOperand")
    this._terms.push({ op: "operand", fn: functionName, args: argumentList.toAST() })  // undefined: var, literalType, literalValue
    return this
  }

  /**
   * Adds an arithmetic operator.
   */
  addArithmeticOperator(operator, precedence) {
    this._terms.push({ op: "math", operator, precedence })
    return this
  }

  /**
   * Adds a comparison operator.
   */
  addComparisonOperator(operator, precedence) {
    this._terms.push({ op: "compare", operator, precedence })
    return this
  }

  /**
   * Adds a boolean operator.
   */
  addBooleanOperator(operator, precedence) {
    this._terms.push({ op: "boolean", operator, precedence })
    return this
  }

  /**
   * Gets the AST nodes representing this expression.
   */
  toAST() {
    return { op: "expression", tree: this._convertToTree(this._terms) }  // not cloned!
  }

  /**
   * Converts an array of terms to a tree, using operator precedences provided by the parser.
   * Note that this adds `left` and `right` properties to terms which represent operators.
   *
   * References:
   * https://www.klittlepage.com/2013/12/22/twelve-days-2013-shunting-yard-algorithm/
   * https://stackoverflow.com/questions/17568067/how-to-parse-a-boolean-expression-and-load-it-into-a-class
   * https://stackoverflow.com/questions/28256/equation-expression-parser-with-precedence/
   * https://en.wikipedia.org/wiki/Shunting-yard_algorithm
   *
   * @private
   */
  _convertToTree(termArray) {
    const stack = []  // holds a mix of operands and operators
    const operatorStack = []

    for (let i = 0; i < termArray.length; i++) {
      const term = termArray[i]

      if (term.op === "operand") {
        stack.push(term)
        continue
      }

      // while there is an operator at the top of the operator stack with greater precedence
      // or the operator at the top of the operator stack has equal precedence and is left associative,
      // pop operators from the operator stack onto the output queue
      while (operatorStack.length && operatorStack[operatorStack.length - 1].precedence >= term.precedence) {
        const operator = operatorStack.pop()
        operator.right = stack.pop()
        operator.left = stack.pop()
        stack.push(operator)
      }

      operatorStack.push(term)
    }

    while (operatorStack.length) {
      const operator = operatorStack.pop()
      operator.right = stack.pop()
      operator.left = stack.pop()
      stack.push(operator)
    }

    // unless the parser has handed us a malformed expression, or we've made a mistake in the algorithm above,
    // there should always be exactly one item in the stack at this point
    if (stack.length !== 1) {
      const stackStr = JSON.stringify(stack, null, 1).replace(/\s+/g, " ")
      throw new Error(`Oops, ${stack.length} items found in the expression stack: ${stackStr}`)
    }

    return stack.pop()
  }
}

module.exports = Expression
