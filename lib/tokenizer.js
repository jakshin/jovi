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
 * lineNum:     line number on which it occurs in the source (1-based)
 * colNum:      column/character number at which it begins on its line (1-based, tabs and other control characters count as 1 column)
 *
 * The opening and closing parens of comments are not included in the comment token's `str`;
 * similarly, the opening/closing quotes of string literals are not included in the string literal token's `str`.
 */
function tokenize(src) {
  if (src.slice(-1) !== "\n") src += "\n"

  const tokens = []
  let token = { type: TokenType.DEFAULT, str: "", punctuation: "", lineNum: 1, colNum: 1 }
  let commentLevel = 1            // only used while processing a comment token
  let collectPunctuation = false  // only used just after a string literal token
  let lineNum = 1
  let colNum = 1  // actually more a character-on-line number, since tabs and other control chars are counted as 1
  let chNum = 0   // character number in the whole source stream

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

    token = { type: newTokenType, str: initialStr || "", punctuation: "", lineNum, colNum }
  }

  // inserts a token into the return list without affecting the current token
  function insertToken(tokenType, str, punctuation = "") {
    tokens.push({ type: tokenType, str, punctuation, lineNum, colNum })
  }

  // returns the last completed/inserted token
  function lastToken() {
    return tokens[tokens.length - 1]
  }

  // rewinds the source stream by one character,
  // so the current character can be reprocessed as part of a different token/type
  function rewind() {
    chNum--
    colNum--
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
        token.colNum++
        continue  // ignore all whitespace which isn't linebreaks
      }

      // comments and string literals can begin without leading whitespace;
      // we allow a comment to interrupt a poetic literal (the spec isn't clear on this)
      if (ch === "(" || ch === '"') {
        completeToken((ch === "(") ? TokenType.COMMENT : TokenType.STRING_LITERAL)
        continue
      }
    }
    else if (token.type === TokenType.COMMENT) {
      // allow "nested" comments; the spec isn't clear on whether this is correct,
      // i.e. whether the comment `(foo (bar))` should terminate at the first or second close-paren
      if (ch === "(") {
        commentLevel++
        token.str += ch
        continue
      }

      // comments end with a close-paren
      if (ch === ")") {
        if (commentLevel === 1) {
          completeToken()
          token.colNum++
        }
        else {
          commentLevel--
          token.str += ch
        }
        continue
      }

      // comments also end at EOL
      // (the spec doesn't actually say whether multi-line comments are allowed, but it seems better not to)
      if (ch === "\n") {
        commentLevel = 1
        completeToken()  // the new token's lineNum/colNum are wrong, but we'll discard it anyway
        rewind()         // reprocess the linebreak
        continue
      }
    }
    else if (token.type === TokenType.STRING_LITERAL) {
      // the spec doesn't mention any way to escape special characters in strings, including double quotes
      if (ch === '"') {
        completeToken()
        token.colNum++
        collectPunctuation = true
        continue
      }

      // strings also end at EOL
      // (the spec doesn't actually say whether multi-line strings are allowed, but it seems better not to)
      if (ch === "\n") {
        completeToken()  // the new token's lineNum/colNum are wrong, but we'll discard it anyway
        rewind()         // reprocess the linebreak
        continue
      }
    }

    // the character isn't special for our current token type; append it and carry on
    token.str += ch
  }

  return tokens
}

module.exports = { tokenize }
