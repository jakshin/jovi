#!/usr/bin/env node
// Creates test suites for test fixtures.

const fs = require("fs")
const path = require("path")

const INDENT_STR = "  "
const TEST_ROOT = path.join(__dirname, "..")  // this file is in the `utils` subdirectory
const FIXTURE_ROOT = path.join(TEST_ROOT, "fixtures")

const SKIP_FIXTURES_IN_JS = [
  // this test works fine interactively in Terminal, but I can't capture its output correctly in the test framework;
  // probably related to https://github.com/nodejs/node/issues/22088 somehow
  "ignoreInput.rock"
]

// This is a bit hacky, but eh...
const forOfficialFixtures = (process.argv[2] === "official")
const inputPath = forOfficialFixtures ? path.join(FIXTURE_ROOT, "official") : FIXTURE_ROOT;

[null, "JS"].forEach((language) => {
  const languageStr = language ? `In${language}` : ""  // language == null means to use the interpreter
  const outputFileName = forOfficialFixtures ? `officialFixtures${languageStr}.test.js` : `fixtures${languageStr}.test.js`

  console.log(`${inputPath} -> ${outputFileName}`)
  let testCode = walkDirectoryTreeAndCreateTests(inputPath, language)

  if (testCode) {
    const requireLine = 'const testWithFixture = require("./utils/testWithFixture")\n'
    testCode = `${requireLine}${testCode}`
    fs.writeFileSync(path.join(TEST_ROOT, outputFileName), testCode)
  }
})

/**
 * Walks a directory tree and creates tests from all subdirectories,
 * calling itself recursively as needed.
 */
function walkDirectoryTreeAndCreateTests(dirPath, language = null) {
  let testCode = buildTestsFromDirectory(dirPath, language)

  fs.readdirSync(dirPath).forEach((name) => {
    if (name === "official") return

    const nameWithPath = path.join(dirPath, name)
    if (fs.statSync(nameWithPath).isDirectory()) {
      testCode += walkDirectoryTreeAndCreateTests(nameWithPath, language)
    }
  })

  return testCode
}

/**
 * Builds a describe() representing a directory,
 * containing an it() for each Rockstar file in the directory.
 */
function buildTestsFromDirectory(dirPath, language = null) {
  let dirRelPath = dirPath.replace(FIXTURE_ROOT, "")
  if (dirRelPath && dirRelPath[0] === "/") dirRelPath = dirRelPath.slice(1)

  let testCode = ""

  fs.readdirSync(dirPath).forEach((name) => {
    if (!name.endsWith(".rock")) return

    const testFunctionName = (language === "JS" && SKIP_FIXTURES_IN_JS.includes(name)) ? "test.skip" : "test"

    const args = [`"${path.join(dirRelPath, name)}"`]
    if (language) {
      args.push(`"${language}"`)
      name += ` converted to ${language}`
    }

    testCode += `\n${INDENT_STR}${testFunctionName}("${name}", () => testWithFixture(${args.join(", ")}))`
  })

  if (testCode) {
    const describeStr = dirRelPath ? dirRelPath.replace(/\//g, ": ") : "miscellaneous"
    testCode = `\ndescribe("${describeStr}", () => {${testCode}\n})\n`
  }

  return testCode
}
