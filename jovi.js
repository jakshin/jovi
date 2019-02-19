#!/usr/bin/env node
// Jovi's command-line interface.
// See lib/joviLib.js for the library's public API.

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

const { print } = require("./lib/utils/terminalIO")
const { printError } = require("./lib/utils/errorReporter")
const chalk = require("chalk")
const debugLog = require("./lib/utils/debugLog")
const fs = require("fs")
const joviLib = require("./lib/joviLib")
const path = require("path")

/**
 * Shows detailed usage info, then exits the program.
 * @param {string} errMsg An error message to show in red before the usage info (optional).
 */
function printUsageAndExit(errMsg = null) {
  const version = getVersion()
  console.log(chalk.bold.cyan(`Jovi Rockstar interpreter and transpiler ${version && "-- version "}${version}\n`))

  if (errMsg) console.error(chalk.red(`Error: ${errMsg}\n`))

  const scriptName = path.basename(process.argv[1])
  console.log("Usage:")
  console.log(`  ${scriptName} [--to=language [--bundle=file.ext] [--overwrite]] file.rock [file.rock ...]`)
  console.log(`  ${scriptName} --eval "code" ["code" ...]`)
  console.log(`  ${scriptName} -h|--help\n`)

  const printOptions = { blankLineAfter: true, highlightWordsMatching: /^--[a-z]+$/, maxWrapWidth: 112 }
  print(`With no options given, all Rockstar source files named on the command line are concatenated together in order,
    parsed and executed. The concatenation enables a lightweight form of dependencies: just name the Rockstar files
    your code depends on at the beginning of the command line.`, printOptions)

  print(`Each file must be syntactically complete; all open blocks are automatically closed at the end of each file
    as it is read, so you can't start a block in one file and continue it in another file.`, printOptions)

  print(`The --to option makes Jovi convert/transpile files to the given target language instead of executing them.
    Currently the only supported target language is "javascript", which you can also call "js".
    If you also pass the --bundle option, all source files are concatenated and converted as a single unit,
    and written to the single named bundle file, again enabling a lightweight form of dependencies;
    otherwise, each file is converted separately, and written to an output file beside the input file,
    with the appropriate extension appended.`, printOptions)

  print(`If an output file already exists, during interactive use Jovi will prompt for permission to overwrite it,
    otherwise printing an error message and aborting; the --overwrite option causes it to instead silently overwrite
    the file.`, printOptions)

  printOptions.blankLineAfter = false
  print(`The --eval option asks Jovi to process command-line arguments as Rockstar code fragments,
    instead of a source file paths. In this mode, all non-option arguments are concatenated together,
    separated by linebreaks, and executed as a single Rockstar program.`, printOptions)

  process.exit(1)
}

/**
 * Gets the program's semantic version, by parsing package.json.
 * Assumes package.json is a sibling of this script in the filesystem,
 * after reading through any symlinks to the script's real path.
 *
 * @returns {string} The program's version.
 */
function getVersion() {
  try {
    const scriptPath = fs.realpathSync(process.argv[1])
    const packagePath = `${path.dirname(scriptPath)}/package.json`
    const packageInfo = JSON.parse(fs.readFileSync(packagePath))
    return packageInfo.version || ""
  }
  catch (err) {
    return ""  // oh well
  }
}

/**
 * Parses the command line, aborting and showing usage info if any problems are encountered.
 * @returns {Object} The parsed command line.
 */
function parseCommandLine() {
  const args = {
    convertTo: null,
    bundlePath: null,
    overwrite: false,
    eval: false,
    debug: false,
    rocks: []  // chunks of source code, or paths to source files
  }

  if (process.argv.length === 2) {
    printUsageAndExit()  // called with no command-line parameters, just show usage
  }

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i]

    if (arg.startsWith("-") && !arg.toLowerCase().endsWith(".rock")) {
      let opt = arg.toLowerCase().trim()
      if (opt === "-h" || opt === "--help") printUsageAndExit()

      if (opt === "--to" || opt === "--to=" || opt === "--bundle" || opt === "--bundle=") {
        if (opt.slice(-1) === "=") opt = opt.slice(0, -1)
        const placeholder = (opt === "--to") ? "language" : "path/file.ext"
        printUsageAndExit(`Option '${opt}' must be used with an argument, like so: ${opt}=${placeholder}`)
      }
      else if (opt.startsWith("--to=")) {
        args.convertTo = arg.trim().slice("--to=".length)
      }
      else if (opt.startsWith("--bundle=")) {
        args.bundlePath = arg.trim().slice("--bundle=".length)
      }
      else if (opt === "--overwrite") args.overwrite = true
      else if (opt === "--eval") args.eval = true
      else if (opt === "--debug") args.debug = true
      else printUsageAndExit(`Invalid option '${opt}'`)
    }
    else {
      args.rocks.push(arg)
    }
  }

  if (args.convertTo) {
    if (!joviLib.canConvertTo(args.convertTo)) printUsageAndExit(`Can't convert to language '${args.convertTo}'`)
    if (args.eval) printUsageAndExit("The --eval and --to options cannot be used together")
  }
  else {
    if (args.bundlePath) printUsageAndExit("The --bundle option can only be used with --to")
    if (args.overwrite) printUsageAndExit("The --overwrite option can only be used with --to")
  }

  if (!args.rocks.length) {
    const desc = args.eval ? "code strings" : "source files"
    printUsageAndExit(`No ${desc} given`)
  }

  return args
}

// do the things
try {
  const args = parseCommandLine()
  if (args.debug) debugLog.opts.enabled = true

  if (args.eval) {
    const src = args.rocks.join("\n")
    joviLib.executeCode(src)
  }
  else if (args.convertTo) {
    joviLib.convert(args.rocks, args.convertTo, args)
  }
  else {
    joviLib.execute(args.rocks)
  }
}
catch (err) {
  printError(err)
  process.exit(2)
}
