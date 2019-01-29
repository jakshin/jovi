// Simplistic utilities that log some info which is helpful while developing/debugging.

const { getTerminalColumns } = require("./terminalIO")
const chalk = require("chalk")
const util = require("util")

/**
 * Options which can be set during operation by callers.
 */
const opts = {
  enabled: false
}

/**
 * Displays a "header" in bright white text.
 * Intended to delimit the various stages of program operation in the terminal output.
 */
function header(str) {
  if (!opts.enabled) return
  console.debug(chalk.bold.white(`===== ${str} =====\n`))
}

/**
 * Displays the given string.
 */
function log(str) {
  if (!opts.enabled) return
  console.debug(str)
}

/**
 * Dumps an arbitrarily deeply nested object to the terminal,
 * using whatever colors util.inspect() likes.
 */
function dump(thingy, compact = true, linebreakBefore = false) {
  if (!opts.enabled) return

  const breakLength = getTerminalColumns(process.stdout, 100)
  const inspectOpts = {
    colors: true,
    depth: null,           // recurse in objects to any depth, not just 2 levels
    maxArrayLength: null,  // show all elements, not just 100
    breakLength,
    compact
  }

  if (linebreakBefore) console.debug()
  console.debug(util.inspect(thingy, inspectOpts))
  console.debug()
}

module.exports = { opts, header, log, dump }
