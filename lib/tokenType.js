/**
 * All possible Jovi token types.
 */
const TokenType = Object.freeze({
  DEFAULT:         Symbol("DEFAULT"),         // anything that's not one of the other types
  END_ALL_BLOCKS:  Symbol("END_ALL_BLOCKS"),  // special token to close any open blocks; like EOF, but in concatenated files
  LINEBREAK:       Symbol("LINEBREAK"),
  COMMENT:         Symbol("COMMENT"),
  STRING_LITERAL:  Symbol("STRING_LITERAL"),
  NUMERIC_LITERAL: Symbol("NUMERIC_LITERAL"),

  // created in the parser, not the tokenizer; replaces any linebreak which follows a linebreak
  BLANK_LINE:      Symbol("BLANK_LINE")
})

module.exports = { TokenType }
