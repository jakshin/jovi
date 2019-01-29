// Utility functions for file IO.

const { normalizeLinebreaks } = require("./strings")
const { prompt } = require("./terminalIO")
const chalk = require("chalk")
const fs = require("fs")

/**
 * Reads an arbitrary number of Rockstar source files from disk (assumes UTF-8 encoding),
 * normalizes all linebreaks to `\n`, removes shebang lines if present,
 * and returns the result as a single string containing all of the source code,
 * concatenated in the order the file paths were given, and separated by ⏎ characters.
 */
function readRockstarFiles(filePaths, verbose = false) {
  let src = ""

  for (const fileNum in filePaths) {
    const filePath = filePaths[fileNum]
    const fileSrc = readRockstarFile(filePath, verbose)
    if (src) src += "⏎\n"  // marker to close any open blocks, like at EOF
    src += fileSrc
  }

  return src
}

/**
 * Reads a Rockstar source file from disk (assumes UTF-8 encoding),
 * normalizes all linebreaks to `\n`, removes a shebang line if present,
 * and returns the result as a string.
 */
function readRockstarFile(filePath, verbose = false) {
  let src
  try {
    src = fs.readFileSync(filePath, "utf8")
  }
  catch (err) {
    const colon = err.message.indexOf(":")
    const comma = err.message.indexOf(",")
    const message = (colon > 0 && comma > 0 && comma > colon) ? err.message.slice(colon + 1, comma).trim() : err.message
    throw { message, filePath, operation: "read", cause: err }
  }

  src = normalizeLinebreaks(src)
  if (src.substr(0, 2) === "#!") {
    const index = src.indexOf("\n")  // never -1, because normalizeLinebreaks()
    src = src.substr(index + 1)
  }

  if (verbose) console.log(chalk.green("◀︎"), filePath)
  return src
}

/**
 * Writes an arbitrary number of text files to disk;
 * pass an object with file paths as keys and contents as values.
 *
 * Optionally overwrites existing files, or prompts an interactive user whether to overwrite,
 * or allows an EEXIST exception to be thrown in non-interactive use.
 */
function writeTextFiles(files, overwrite) {
  for (const filePath in files) {
    const content = files[filePath]

    try {
      if (!overwrite && process.stdin.isTTY && fs.existsSync(filePath)) {
        const response = prompt(`Overwrite ${filePath} [Yes/No/Cancel/All]? `, "ynca").toLowerCase()

        if (response === "y" || response === "a") {
          if (response === "a") overwrite = true
          writeTextFile(filePath, content, true)
        }
        else if (response === "n") continue
        else if (response === "c") break
      }
      else {
        writeTextFile(filePath, content, overwrite)
      }
    }
    catch (err) {
      const colon = err.message.indexOf(":")
      const comma = err.message.indexOf(",")
      const message = (colon > 0 && comma > 0 && comma > colon) ? err.message.slice(colon + 1, comma).trim() : err.message
      throw { message, filePath, operation: "write", cause: err }
    }
  }
}

/**
 * Writes a text file to disk, using UTF-8 encoding.
 * Optionally overwrites an existing file, or allows an EEXIST exception to be thrown.
 * @private
 */
function writeTextFile(filePath, content, overwrite) {
  const options = { encoding: "utf8", mode: 0o666, flag: overwrite ? "w" : "wx" }
  fs.writeFileSync(filePath, content, options)
  console.log(chalk.green("▶︎"), filePath)
}

module.exports = { readRockstarFiles, readRockstarFile, writeTextFiles }
