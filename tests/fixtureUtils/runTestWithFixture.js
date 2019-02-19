const fs = require("fs")
const joviLib = require("../../lib/joviLib")
const path = require("path")
const readlineSync = require("readline-sync")

const TEST_ROOT = path.join(__dirname, "..")  // this file is in the `fixtureUtils` subdirectory
const FIXTURE_ROOT = path.join(TEST_ROOT, "fixtures")

/**
 * Runs a test using the given test fixture, which is expected to be a Rockstar source file.
 * Its output is expected to match the corresponding *.out file;
 * if it requires input, it'll be pumped in from the corresponding *.in or *.in' file.
 */
function runTestWithFixture(fixtureFileRelPath) {
  jest.checkingTestFixtures = true  // abbreviate error output

  const fixtureFileAbsPath = path.join(FIXTURE_ROOT, fixtureFileRelPath)
  if (!fs.existsSync(fixtureFileAbsPath)) {
    fail(`Fixture doesn't exist: ${fixtureFileRelPath}`)
    return
  }

  const mockInput = getMockInput(fixtureFileAbsPath)
  const expectedOutput = getExpectedOutput(fixtureFileAbsPath)
  const actualOutput = execute(fixtureFileAbsPath, mockInput)
  expect(actualOutput).toBe(expectedOutput)
}

// Executes a test fixture using the given mock input, capturing and returning any output.
function execute(fixtureFileAbsPath, mockInput) {
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
}

// Gets the mocked input for a test fixture, from the corresponding *.in or *.in' file.
function getMockInput(fixtureFileAbsPath) {
  for (const extension of ["in", "in'"]) {
    const inputFileAbsPath = `${fixtureFileAbsPath}.${extension}`
    if (fs.existsSync(inputFileAbsPath)) return readFile(inputFileAbsPath, true)
  }

  return []  // no input needed
}

// Gets the expected output for a test fixture, from the corresponding *.out file.
function getExpectedOutput(fixtureFileAbsPath) {
  const outputFileAbsPath = `${fixtureFileAbsPath}.out`
  if (fs.existsSync(outputFileAbsPath)) return readFile(outputFileAbsPath)

  return ""  // no output expected
}

// Reads a file, returning either a string or an array of strings (one per line).
function readFile(fileAbsPath, asArray = false) {
  let text = fs.readFileSync(fileAbsPath, "utf8")
  if (!asArray) return text

  if (text.slice(-1) === "\n") text = text.slice(0, -1)
  return text.split(/\r?\n/)
}

module.exports = runTestWithFixture
