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
    this._terms.push({ op: "operand", var: variableName })  // undefined: fn, arguments, value, valueType
    return this
  }

  /**
   * Adds an operand representing a string, numeric, or type literal.
   */
  addLiteralOperand(literalType, literalValue) {
    astChecker.checkLiteral(literalType, literalValue, "Expression.addLiteralOperand")
    this._terms.push({ op: "operand", value: literalValue, valueType: literalType })  // undefined: fn, arguments, var
    return this
  }

  /**
   * Adds an operand representing a function call, along with its arguments.
   */
  addFunctionCallOperand(functionName, argumentList) {
    astChecker.checkName(functionName, "Expression.addFunctionCallOperand")
    astChecker.checkArgumentList(argumentList, true, "Expression.addFunctionCallOperand")
    this._terms.push({ op: "operand", fn: functionName, arguments: argumentList.toAST() })
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
    return { op: "expression", terms: this._terms }  // not cloned!
  }
}

// !!! can't have operands in a row, or operators in a row

module.exports = Expression
