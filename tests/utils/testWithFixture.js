const fs = require("fs")
const joviLib = require("../../lib/joviLib")
const path = require("path")
const readlineSync = require("readline-sync")
const spawnSync = require("child_process").spawnSync

const TEST_ROOT = path.join(__dirname, "..")  // this file is in the `utils` subdirectory
const FIXTURE_ROOT = path.join(TEST_ROOT, "fixtures")

/**
 * Tests using the given test fixture, which is expected to be a Rockstar source file.
 * Its output is expected to match the corresponding *.out file;
 * if it requires input, it'll be pumped in from the corresponding *.in or *.in' file.
 */
function testWithFixture(fixtureFileRelPath, language = null) {
  const fixtureFileAbsPath = path.join(FIXTURE_ROOT, fixtureFileRelPath)
  if (!fs.existsSync(fixtureFileAbsPath)) {
    fail(`Fixture doesn't exist: ${fixtureFileRelPath}`)
    return
  }

  const mockInput = getMockInput(fixtureFileAbsPath, !language)
  const expectedOutput = getExpectedOutput(fixtureFileAbsPath)
  const expectedErrorMessage = getExpectedErrorMessage(fixtureFileAbsPath)

  const testRunner = testRunners[language || "interpreter"]
  const { actualOutput, actualErrorMessage } = testRunner(fixtureFileAbsPath, mockInput)

  expect(actualOutput).toBe(expectedOutput)
  expect(actualErrorMessage).toBe(expectedErrorMessage)
}

/**
 * Test runners. Each executes a test fixture using the given mock input,
 * capturing and returning any output and error message if an exception was thrown.
 * @private
 */
const testRunners = {
  interpreter: (fixtureFileAbsPath, mockInput) => {
    // run the test using the interpreter

    jest.spyOn(readlineSync, "question").mockImplementation(() => {
      return mockInput.shift()
    })

    let actualOutput = ""
    jest.spyOn(console, "log").mockImplementation((arg) => {
      actualOutput += `${arg}\n`
    })

    let actualErrorMessage = ""
    jest.spyOn(console, "error").mockImplementation(() => {})

    try {
      joviLib.execute(fixtureFileAbsPath)
    }
    catch (err) {
      actualErrorMessage = err.message
    }
    finally {
      readlineSync.question.mockRestore()
      console.log.mockRestore()
      console.error.mockRestore()
    }

    return { actualOutput, actualErrorMessage }
  },

  JS: (fixtureFileAbsPath, mockInput) => {
    // run the test by converting to JavaScript and executing the result under Node.js

    const fixtureFileName = path.basename(fixtureFileAbsPath)
    const outputFilePath = path.join(process.env.TMPDIR, `${fixtureFileName}.js`)

    let actualOutput = ""
    let actualErrorMessage = ""
    jest.spyOn(console, "error").mockImplementation(() => {})

    try {
      joviLib.convert(fixtureFileAbsPath, "js", { bundlePath: outputFilePath, overwrite: true })

      const result = spawnSync("node", [outputFilePath], {
        input: mockInput,
        stdio: [null, null, "pipe"],
        timeout: 10000,  // 10 seconds
        encoding: "utf8",
        windowsHide: true
      })

      actualOutput = result.stdout
      actualErrorMessage = findErrorMessage(result.stderr)
    }
    catch (err) {
      actualErrorMessage = findErrorMessage(err.message)
    }
    finally {
      console.error.mockRestore()
      if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath)
    }

    return { actualOutput, actualErrorMessage }
  }
}

/**
 * Finds the original error message, i.e. the message thrown,
 * in the glob of error output Node.js makes when running a JS file which throws an exception.
 * @private
 */
function findErrorMessage(errorOutput) {
  const begin = errorOutput.indexOf("Error:")
  if (begin === -1) return errorOutput

  let end = errorOutput.indexOf("\n", begin)
  if (end === -1) end = undefined

  return errorOutput.slice(begin + "Error:".length, end).trim()
}

/**
 * Gets the mocked input for a test fixture, from the corresponding *.in or *.in' file.
 * @private
 */
function getMockInput(fixtureFileAbsPath, asArray) {
  for (const extension of ["in", "in'"]) {
    const inputFileAbsPath = `${fixtureFileAbsPath}.${extension}`
    if (fs.existsSync(inputFileAbsPath)) return readFile(inputFileAbsPath, asArray)
  }

  return asArray ? [] : ""  // no input needed
}

/**
 * Gets the expected output for a test fixture, from the corresponding *.out file.
 * @private
 */
function getExpectedOutput(fixtureFileAbsPath) {
  const outputFileAbsPath = `${fixtureFileAbsPath}.out`
  if (fs.existsSync(outputFileAbsPath)) return readFile(outputFileAbsPath)

  return ""  // no output expected
}

/**
 * Gets the expected error message for a test fixture, from the corresponding *.er file.
 * @private
 */
function getExpectedErrorMessage(fixtureFileAbsPath) {
  const outputFileAbsPath = `${fixtureFileAbsPath}.er`
  if (fs.existsSync(outputFileAbsPath)) return readFile(outputFileAbsPath).trim()

  return ""  // no error message expected
}

/**
 * Reads a file, returning either a string or an array of strings (one per line).
 * @private
 */
function readFile(fileAbsPath, asArray = false) {
  const text = fs.readFileSync(fileAbsPath, "utf8")
  return asArray ? text.split(/\r?\n/) : text
}

module.exports = testWithFixture
