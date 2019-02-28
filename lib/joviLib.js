// Jovi's public API.

/*
Copyright (c) 2018 Jason Jackson

This program is free software: you can redistribute it and/or modify it under the terms
of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.
If not, see <http://www.gnu.org/licenses/>.
*/

const { loadGenerator } = require("./generators")
const { parse } = require("./parser")
const { printParseError, printRuntimeError } = require("./utils/errorReporter")
const { readRockstarFiles, readRockstarFile, writeTextFiles } = require("./utils/fileIO")
const { tokenize } = require("./tokenizer")
const debugLog = require("./utils/debugLog")
const interpreter = require("./interpreter")

/**
 * Executes the given Rockstar source files in Jovi's interpreter,
 * after concatenating them all together into a single source stream.
 *
 * Each file must be syntactically complete (it would execute on its own),
 * e.g. you cannot open a block in one file and continue it in another file.
 * All open blocks are automatically closed at the end of each file as it is read.
 *
 * Throws exceptions to report any problems: plain objects with `message` properties
 * for controlled logical-level errors, Error objects for unexpected runtime problems.
 *
 * @param {(string|string[])} filePaths The path to the Rockstar source file to execute, or an array of them.
 * @returns {void}
 */
function execute(filePaths) {
  if (!Array.isArray(filePaths)) {
    filePaths = [filePaths]
  }

  const src = readRockstarFiles(filePaths)
  executeCode(src)
}

/**
 * Executes the given Rockstar source code in Jovi's interpreter.
 *
 * Throws exceptions to report any problems: plain objects with `message` properties
 * for controlled logical-level errors, Error objects for unexpected runtime problems.
 *
 * @param {string} src The Rockstar source code to parse and execute.
 * @returns {void}
 */
function executeCode(src) {
  const ast = parseToAST(src)

  try {
    debugLog.header("Executing")
    interpreter.execute(ast)
  }
  catch (err) {
    if (err.runtime) printRuntimeError(err.message)  // !!! display this error with more context... source line?
    throw err
  }
}

/**
 * Reports whether the given language is supported as a conversion/transpilation target.
 *
 * @param {string} targetLanguage The language to check for support (e.g. "JavaScript"). Case-insensitive.
 * @returns {boolean} Whether the target language is supported.
 */
function canConvertTo(targetLanguage) {
  try {
    const generator = loadGenerator(targetLanguage)
    return !!generator
  }
  catch (err) {
    return false
  }
}

/**
 * Converts/transpiles the given Rockstar source files to the given target language.
 * Writes one or more files containing source code in the target language.
 *
 * If the `bundlePath` option is given, all input files are concatenated into a single stream,
 * converted together as a single unit, and the result is written to the bundle file; otherwise,
 * each is converted separately and the result is written to a file alongside the input source file,
 * with an appropriate extension.
 *
 * In either case, each file must be syntactically complete (it would convert on its own),
 * e.g. you cannot open a block in one file and continue it in another file.
 * All open blocks are automatically closed at the end of each file as it is read.
 *
 * If the `overwrite` option is given, any existing output files are automatically overwritten;
 * otherwise, in inactive use a prompt is shown on stdout requesting permission to overwrite,
 * and in non-interactive use an error message is shown on stderr and the conversion is aborted.
 *
 * Throws exceptions to report any problems: plain objects with `message` properties
 * for controlled logical-level errors, Error objects for unexpected runtime problems.
 *
 * @param {(string|string[])} filePaths The path to the Rockstar source file to convert, or an array of them.
 * @param {string} targetLanguage The language to convert to (e.g. "JavaScript"). Case-insensitive.
 *
 * @param {Object} options Additional options:
 * @param {string} options.bundlePath The file in which to write the code as converted to the target language,
 *    after concatenating all input source files together and converting them as a single unit.
 *    If not given, each file is converted independently and the results are written alongside the inputs.
 * @param {boolean} options.overwrite Automatically overwrite files, instead of prompting (in interactive use) or aborting.
 * @param {boolean} options.verbose Display the path/name of each file as it is read or written.
 *
 * @returns {void}
 */
function convert(filePaths, targetLanguage, options = {}) {
  if (!Array.isArray(filePaths)) {
    filePaths = [filePaths]
  }

  const convertedFiles = {}

  if (options.bundlePath) {
    const src = readRockstarFiles(filePaths, !!options.verbose)
    const converted = convertCode(src, targetLanguage)
    convertedFiles[options.bundlePath] = converted
  }
  else {
    const ext = loadGenerator(targetLanguage).extension()

    for (const fileNum in filePaths) {
      const filePath = filePaths[fileNum]
      const src = readRockstarFile(filePath, !!options.verbose)
      const converted = convertCode(src, targetLanguage)
      convertedFiles[`${filePath}${ext}`] = converted
    }
  }

  // write output file(s) after all input files have been successfully read and converted
  writeTextFiles(convertedFiles, !!options.overwrite, !!options.verbose)
}

/**
 * Converts/transpiles the given Rockstar source code to the given target language.
 *
 * Throws exceptions to report any problems: plain objects with `message` properties
 * for controlled logical-level errors, Error objects for unexpected runtime problems.
 *
 * @param {string} src The Rockstar source code to parse and convert.
 * @param {string} targetLanguage The language to convert to (e.g. "JavaScript"). Case-insensitive.
 * @returns {string} The converted source code in the target language.
 */
function convertCode(src, targetLanguage) {
  const ast = parseToAST(src)
  const generator = loadGenerator(targetLanguage)

  debugLog.header(`Converting to ${targetLanguage.toUpperCase()}`)
  const converted = generator.generate(ast)
  debugLog.log(converted)
  return converted
}

/**
 * Tokenizes and parses the given Rockstar source code into an AST.
 *
 * Throws exceptions to report any problems: plain objects with `message` properties
 * for controlled logical-level errors, Error objects for unexpected runtime problems.
 * If a parser error occurs (i.e. bad Rockstar syntax was encountered in the input),
 * the problem is first printed to stderr.
 *
 * @param {string} src The Rockstar source code to parse.
 * @returns {Object} The AST; you can pass it to Jovi's interpreter or one of its code generators.
 * @private
 */
function parseToAST(src) {
  try {
    src = String(src)

    debugLog.header("Tokenizing")
    const tokens = tokenize(src)
    debugLog.dump(tokens)

    debugLog.header("Parsing into AST")
    const ast = parse(tokens)
    debugLog.dump(ast.root)

    return ast
  }
  catch (err) {
    if (err.token) printParseError(err.message, err.token, src)
    throw err
  }
}

module.exports = { execute, executeCode, canConvertTo, convert, convertCode }
