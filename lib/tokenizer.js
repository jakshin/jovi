// Jovi's tokenizer.
// It generates a list of tokens from a Rockstar program's source code.

const { isWhitespace, isControl, isNumeric, isPunctuation, splitPunctuation } = require("./utils/strings")
const { TokenType } = require("./tokenType")

/**
 * Parses a string containing a Rockstar program's source code into a list of tokens,
 * each of which has the following properties:
 *
 * type:        TokenType
 * str:         string contents of the token, minus any trailing punctuation; each linebreak is stored as a separate token,
 *              each full comment and string/numeric literal is a token (regardless of how many words it contains),
 *              and any other whitespace-delimited word is a token
 * punctuation: any punctuation found at the end of the token, for string/numeric literals and default tokens
 * whitespace:  any whitespace following the token and its punctuation, up to but not including a linebreak
 * lineNum:     line number on which it begins in the source (1-based)
 * colNum:      column/character number at which it begins on its line (1-based, tabs and other control characters count as 1 column)
 *
 * The opening and closing parens of comments are not included in the comment token's `str`;
 * similarly, the opening/closing quotes of string literals are not included in the string literal token's `str`.
 */
function tokenize(src) {
  if (src.slice(-1) !== "\n") src += "\n"

  const tokens = []
  let token = { type: TokenType.DEFAULT, str: "", punctuation: "", whitespace: "", lineNum: 1, colNum: 1 }
  let collectPunctuation = false  // only used just after a string literal token
  let lineNum = 1
  let colNum = 1  // actually more a character-on-line number, since tabs and other control chars are counted as 1
  let chNum = 0   // character number in the whole source stream

  // collects a whitespace character into the last completed token (if there is one)
  function collectWhitespace(ch) {
    if (!tokens.length) return
    lastToken().whitespace += ch
  }

  // completes the current token by adding it to the return list, and resetting to the passed new type
  function completeToken(newTokenType = TokenType.DEFAULT, initialStr = null) {
    if (token.type !== TokenType.DEFAULT) {
      tokens.push(token)
    }
    else if (token.str !== "") {
      // split any punctuation off the end, and store it separately (done via collectPunctuation for string literals)
      const { base, punctuation } = splitPunctuation(token.str)
      if (base !== "") {
        token.str = base
        token.punctuation = punctuation
      }

      if (isNumeric(token.str)) {
        token.type = TokenType.NUMERIC_LITERAL
        token.str = token.str.replace(/[,+]/g, "")
      }

      tokens.push(token)
    }

    token = { type: newTokenType, str: initialStr || "", punctuation: "", whitespace: "", lineNum, colNum }
  }

  // inserts a token into the return list without affecting the current token
  function insertToken(tokenType, str, punctuation = "") {
    tokens.push({ type: tokenType, str, punctuation, whitespace: "", lineNum, colNum })
  }

  // returns the last completed/inserted token
  function lastToken() {
    return tokens[tokens.length - 1]
  }

  for (chNum = 0; chNum < src.length; chNum++, colNum++) {
    const ch = src[chNum]

    if (collectPunctuation) {
      if (isPunctuation(ch)) {
        lastToken().punctuation += ch
        continue
      }
      else {
        collectPunctuation = false
      }
    }

    if (token.type === TokenType.DEFAULT) {
      if (ch === "⏎") {
        // our special end-all-blocks marker, to preserve end-all-blocks-at-EOF logic when concatenating files
        completeToken()
        insertToken(TokenType.END_ALL_BLOCKS, ch)
        token.colNum++
        continue
      }

      if (ch === "\n") {
        completeToken()
        insertToken(TokenType.LINEBREAK, ch)
        token.lineNum = ++lineNum
        token.colNum = 1
        colNum = 0  // will be incremented as soon as we continue
        continue
      }

      if (isWhitespace(ch) || isControl(ch)) {
        completeToken()
        collectWhitespace(ch)
        token.colNum++
        continue
      }

      // comments and string literals can begin without leading whitespace;
      // we allow a comment to interrupt a poetic literal (the spec isn't clear on this)
      if (ch === "(" || ch === '"') {
        completeToken((ch === "(") ? TokenType.COMMENT : TokenType.STRING_LITERAL)
        continue
      }
    }
    else if (token.type === TokenType.COMMENT) {
      // comments end only with a close-paren
      // ("nested" comments aren't allowed, and comments can span multiple lines)
      if (ch === ")") {
        completeToken()
        token.colNum++
        continue
      }
    }
    else if (token.type === TokenType.STRING_LITERAL) {
      // strings end only with another double quote
      // (the spec doesn't mention any way to escape special characters in strings, including double quotes)
      if (ch === '"') {
        completeToken()
        token.colNum++
        collectPunctuation = true
        continue
      }
    }

    // the character isn't special for our current token type; append it and carry on
    token.str += ch
  }

  // throw a parser error if there is an unterminated comment or string, which isn't all whitespace
  if (token.str.trim()) {
    if (token.type === TokenType.COMMENT) throw { message: "Unterminated comment", token }
    if (token.type === TokenType.STRING_LITERAL) throw { message: "Unterminated string literal", token }
  }

  return tokens
}

module.exports = { tokenize }
