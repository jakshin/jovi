// Jovi's error reporter.
// It knows stuff like how to show the relevant info from an exception,
// and how to print a line of Rockstar source code with a marker on the errant token.

const { getTerminalColumns } = require("./terminalIO")
const { isControl, padLeft } = require("./strings")
const chalk = require("chalk")
const debugLog = require("./debugLog")

/**
 * Prints information about an error (except parser and runtime errors, which should be handled separately).
 * Handles logical-level errors (POJO thrown) as well as lower-level unexpected errors (Error object thrown).
 */
function printError(err) {
  const isErrorObj = (err instanceof Error)

  // parser errors are POJOs with a `token` property (bad input in source file);
  // we can't display those well without access to the Rockstar source code,
  // so they're handled separately via printParseError()
  if (err.token && !isErrorObj) return

  // runtime errors are POJOs with a `runtime` property (bad program logic);
  // they're handled separately via printRuntimeError()
  if (err.runtime && !isErrorObj) return

  // generator loading errors are POJOs with a `language` property
  if (err.language && !isErrorObj) {
    console.error(chalk.red(`Unable to load code generator for ${err.language}: ${err.message}`))
    if (err.cause) debugLog.dump(err.cause, false, true)
    return
  }

  // file IO errors are POJOs with `filePath` and `operation` properties (operation = "read" or "write")
  if (err.filePath && !isErrorObj) {
    console.error(chalk.red(`Unable to ${err.operation} file ${err.filePath}: ${err.message}`))
    if (err.cause) debugLog.dump(err.cause, false, true)
    return
  }

  // something else went wrong: something... *unexpected* 😮
  let errMsg = chalk.red(`Unexpected internal error: `)
  errMsg += (err.message && err.message.includes("\u0033")) ? err.message : chalk.red(err.message)

  console.error(errMsg)
  console.error(chalk.red("Sorry :-/"))
  if (err.stack) console.log(`\n${err.stack}`)
  if (err.astNode) debugLog.dump(err.astNode, false, true)
}

/**
 * Prints information about a parse error: the error message returned by the parser (in red),
 * 1-3 lines of source code before the line where the error was detected for context,
 * then the errant line of source code, then a line with a caret pointing to the errant token.
 * All output is written to stderr.
 *
 * Note that it expects the passed source-code string to contain only `\n` linebreaks,
 * and to be terminated by a linebreak.
 */
function printParseError(errorMessage, token, src) {
  console.error(chalk.red(`Parse error on line ${token.lineNum}: ${errorMessage}`))

  const lines = src.split(/\n/)
  const errLine = lines[token.lineNum - 1]  // token.lineNum is 1-based
  const errLineNum = String(token.lineNum)

  // print prelude lines, then the line containing the errant token
  const maxPreludes = 3
  const preludes = []

  for (let displayLineNum = token.lineNum - 1; displayLineNum > 0; displayLineNum--) {
    const line = lines[displayLineNum - 1]
    preludes.unshift(`${padLeft(displayLineNum, errLineNum.length, "0")}: ${line}`)
    if (preludes.length >= maxPreludes) break
  }

  for (const lineNum in preludes) printSourceCode(preludes[lineNum])
  printSourceCode(`${errLineNum}: ${errLine}`)

  // print a caret under the beginning of the token detected as errant,
  // compensating if the line containing that token will wrap when printed
  const terminalColumns = getTerminalColumns(process.stderr)
  const caretAtColNum = ((token.colNum - 1) + errLineNum.length + 2) % terminalColumns  // token.colNum is 1-based
  const dashes = "-".repeat(caretAtColNum)
  console.error(chalk.gray(dashes) + chalk.bold.white("^"))
}

/**
 * Prints information about a runtime error.
 * Runtime errors occur due to bad program logic, i.e. bad user input of the kind that the parser can't detect;
 * they're not due to an internal failure in Jovi.
 */
function printRuntimeError(errorMessage) {
  console.error(chalk.red(`Runtime error: ${errorMessage}`))
}

/**
 * Prints a line of source code.
 * This displays a gray dot in place of any control character (e.g. tab),
 * to make it straightforward to visually line our error marker up with the erroneous token.
 * @private
 */
function printSourceCode(line) {
  let printable = ""

  for (const chNum in line) {
    const ch = line[chNum]
    if (isControl(ch)) printable += chalk.gray("\u00b7")
    else printable += ch
  }

  console.error(printable)
}

module.exports = { printError, printParseError, printRuntimeError }
