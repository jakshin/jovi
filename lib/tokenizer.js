// Jovi's tokenizer.
// It generates a list of tokens from a Rockstar program's source code.

const { isWhitespace, isControl, isPunctuation, splitPunctuation } = require("./utils/strings")
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
 * lineNum:     line number on which it occurs in the source
 * colNum:      column/character number at which it begins on its line (tabs and other control characters are counted as 1 column)
 *
 * Note that it expects the passed source-code string to contain only `\n` linebreaks,
 * and to be terminated by a linebreak.
 */
function tokenize(src) {
  const tokens = []
  let token = { type: TokenType.DEFAULT, str: "", punctuation: "", lineNum: 1, colNum: 1 }
  let commentLevel = 1            // only used while processing a comment token
  let collectPunctuation = false  // only used just after a string/numeric literal token
  let lineNum = 1
  let colNum = 1  // actually more a character-on-line number, since tabs and other control chars are counted as 1
  let chNum = 0   // character number in the whole source stream

  // completes the current token by adding it to the return list, and resetting to the passed new type
  function completeToken(newTokenType = TokenType.DEFAULT, initialStr = null) {
    if (token.type !== TokenType.DEFAULT) {
      tokens.push(token)
    }
    else if (token.str !== "") {
      // split any punctuation off the end, and store it separately (done elsewhere for string/numeric literals)
      const { base, punctuation } = splitPunctuation(token.str)
      token.str = base
      token.punctuation = punctuation
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

  // peeks ahead in the source stream,
  // returning null if the desired number of characters doesn't remain ahead
  function peekAhead(numChars) {
    const chars = src.substr(chNum + 1, numChars)
    return chars.length === numChars ? chars : null
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

      // numbers must begin after whitespace, and start with a digit, optionally preceded by a leading minus sign,
      // e.g. we don't treat `.123`, `--1` or `+1` as numeric literals (the spec isn't clear on this)
      if (token.str === "") {
        const charIsDigit = "1234567890".includes(ch)
        const charIsDashAndNextCharIsDigit = ch === "-" && "1234567890".includes(peekAhead(1))

        if (charIsDigit || charIsDashAndNextCharIsDigit) {
          completeToken(TokenType.NUMERIC_LITERAL, ch)
          continue
        }
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
    else if (token.type === TokenType.NUMERIC_LITERAL) {
      // whitespace ends the literal
      if (isWhitespace(ch) || isControl(ch)) {
        completeToken()            // if ch is a linebreak, the new token's lineNum/colNum are wrong, but we'll discard it anyway
        if (ch === "\n") rewind()  // reprocess the linebreak
        continue
      }

      // a comma, if there's another digit following, is just ignored (so numbers can be written like "1,000");
      // this should be okay since whitespace must separate function parameters
      const nextCharIsDigit = "1234567890".includes(peekAhead(1))
      if (ch === "," && nextCharIsDigit) continue

      // other punctuation, except a dot if there's another digit following, ends the literal
      if (isPunctuation(ch) && !(ch === "." && nextCharIsDigit)) {
        completeToken()
        rewind()  // reprocess the punctuation
        collectPunctuation = true
        continue
      }

      // if we see any other character which doesn't belong in the literal,
      // switch to treating it not as a numeric literal after all, and carry on
      // !!! also do this if the character is a dot and the token already contains a dot
      if (!"1234567890.".includes(ch)) {
        token.type = TokenType.DEFAULT
        token.str += ch
        continue
      }
    }

    // the character isn't special for our current token type; append it and carry on
    token.str += ch
  }

  return tokens
}

module.exports = { tokenize }
