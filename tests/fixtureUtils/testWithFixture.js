const execSync = require("child_process").execSync
const fs = require("fs")
const joviLib = require("../../lib/joviLib")
const path = require("path")
const readlineSync = require("readline-sync")

const TEST_ROOT = path.join(__dirname, "..")  // this file is in the `fixtureUtils` subdirectory
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

  const testRunner = testRunners[language || "-"]
  const actualOutput = testRunner(fixtureFileAbsPath, mockInput)

  expect(actualOutput).toBe(expectedOutput)
}

/**
 * Test runners.
 * Each executes a test fixture using the given mock input, capturing and returning any output.
 */
const testRunners = {
  "-": (fixtureFileAbsPath, mockInput) => {
    // run the test using the interpreter
    try {
      jest.spyOn(readlineSync, "question").mockImplementation(() => {
        return mockInput.shift()
      })

      let actualOutput = ""
      jest.spyOn(console, "log").mockImplementation((arg) => {
        actualOutput += `${arg}\n`
      })

      joviLib.execute(fixtureFileAbsPath)
      return actualOutput
    }
    finally {
      readlineSync.question.mockRestore()
      console.log.mockRestore()
    }
  },

  "JS": (fixtureFileAbsPath, mockInput) => {
    // run the test by converting to JavaScript and executing the result under Nodejs
    const fixtureFileName = path.basename(fixtureFileAbsPath)
    const outputFilePath = path.join(process.env.TMPDIR, `${fixtureFileName}.js`)

    try {
      joviLib.convert(fixtureFileAbsPath, "js", { bundlePath: outputFilePath, overwrite: true })

      const actualOutput = execSync(`node "${outputFilePath}"`, {
        input: mockInput,
        timeout: 10000,  // 10 seconds
        encoding: "utf8",
        windowsHide: true
      })

      return actualOutput
    }
    finally {
      if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath)
    }
  }
}

/**
 * Gets the mocked input for a test fixture, from the corresponding *.in or *.in' file.
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
 */
function getExpectedOutput(fixtureFileAbsPath) {
  const outputFileAbsPath = `${fixtureFileAbsPath}.out`
  if (fs.existsSync(outputFileAbsPath)) return readFile(outputFileAbsPath)

  return ""  // no output expected
}

/**
 * Reads a file, returning either a string or an array of strings (one per line).
 */
function readFile(fileAbsPath, asArray = false) {
  const text = fs.readFileSync(fileAbsPath, "utf8")
  return asArray ? text.split(/\r?\n/) : text
}

module.exports = testWithFixture
