// Utility functions for terminal IO.

const chalk = require("chalk")
const readlineSync = require("readline-sync")

/**
 * Gets the number of columns in the terminal, or Infinity if we're not outputting to a TTY,
 * e.g. if stdout/stderr has been redirected to a file.
 *
 * You are expected to pass either process.stdout or process.stderr in `outputStream`.
 * You can optionally cap the returned value.
 */
function getTerminalColumns(outputStream, cap = Infinity) {
  const columns = outputStream.isTTY ? outputStream.columns : Infinity
  return (cap && cap < columns) ? cap : columns
}

/**
 * Prints a string to stdout, word-wrapped to fit nicely within the terminal if outputting to a TTY.
 *
 * Options:
 * blankLineAfter: print an extra blank line after the string, to make it a "paragraph"
 * highlightWordsMatching: regex to match words which should be highlighted in bright white
 * maxWrapWidth: wrap after N columns max, regardless of terminal width (or if not outputting to a TTY)
 */
function print(str, options = {}) {
  const columns = getTerminalColumns(process.stdout, options.maxWrapWidth)
  const words = str.split(/\s+/)
  let line = ""
  let lineLength = 0  // track separately because chalk escape codes

  words.forEach((word) => {
    if (line.length && lineLength + word.length + 1 >= columns) {
      console.log(line)
      line = ""
      lineLength = 0
    }

    if (line) {
      line += " "
      lineLength++
    }

    line += (options.highlightWordsMatching && options.highlightWordsMatching.test(word)) ? chalk.bold.white(word) : word
    lineLength += word.length
  })

  if (line) console.log(line)
  if (options.blankLineAfter) console.log()
}

/**
 * Prompts the user for a single-character response using the given message,
 * accepting and returning only one of the given characters. Ignores Ctrl-C.
 */
function prompt(msg, allowedResponseChars) {
  return readlineSync.keyIn(chalk.bold.white(msg), {
    limit: allowedResponseChars  // list of allowed characters
  })
}

module.exports = { getTerminalColumns, print, prompt }
