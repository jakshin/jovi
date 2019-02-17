const astChecker = require("./astChecker")

/**
 * An argument-list builder.
 */
class ArgumentList {
  /**
   * Creates a new instance.
   * You need to tell if whether you're creating an argument list for a function call or declaration.
   */
  constructor(forFunctionCall) {
    this._forFunctionCall = !!forFunctionCall
    this._args = []
  }

  /**
   * Gets whether or not this argument list is for a function call.
   */
  get forFunctionCall() {
    return this._forFunctionCall
  }

  /**
   * Adds a variable-name argument to the list.
   * Can be called on argument lists for function calls or declarations.
   */
  addArgument(variableName) {
    astChecker.checkName(variableName, "ArgumentList.addArgument")
    this._args.push({ op: "arg", var: variableName, value: undefined, valueType: undefined })
    return this
  }

  /**
   * Adds a literal-valied argument to the list.
   * Can only be called on argument lists for function calls (declarations must use variable names).
   */
  addArgumentWithLiteral(literalType, literalValue) {
    if (!this._forFunctionCall) {
      throw new Error(`Oops, "${literalType}" literal with value [${literalValue}] added to argument list for a function declaration`)
    }

    astChecker.checkLiteral(literalType, literalValue, "ArgumentList.addArgumentWithLiteral")
    this._args.push({ op: "arg", var: undefined, value: literalValue, valueType: literalType })
    return this
  }

  /**
   * Gets the AST nodes representing this argument list.
   */
  toAST() {
    return this._args  // not cloned!
  }
}

module.exports = ArgumentList
