const { printError, printParseError } = require("../../../lib/utils/errorReporter")
const debugLog = require("../../../lib/utils/debugLog")

describe("errorReporter", () => {
  const testErrorMessage = "well *that* didn't go as planned..."
  const testCause = new Error("my bad")
  const testToken = { colNum: 42, lineNum: 7 }
  let consoleErrorSpy, consoleLogSpy, debugSpy

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {})
    debugSpy = jest.spyOn(debugLog, "dump").mockImplementation(() => {})
  })

  describe("printError()", () => {
    it("prints a generator error in red", () => {
      printError({
        language: "foolang",
        message: testErrorMessage,
        cause: testCause
      })

      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining("[31m"))
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining("Unable to load code generator"))
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining("foolang"))
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining(testErrorMessage))
      expect(debugSpy).toHaveBeenLastCalledWith(testCause, expect.any(Boolean), expect.any(Boolean))
    })

    it("prints a file IO error in red", () => {
      printError({
        filePath: "foo/bar.rock",
        operation: "read",
        message: testErrorMessage,
        cause: testCause
      })

      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining("[31m"))
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining("Unable to read file"))
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining("foo/bar.rock"))
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining(testErrorMessage))
      expect(debugSpy).toHaveBeenLastCalledWith(testCause, expect.any(Boolean), expect.any(Boolean))
    })

    it("prints an unexpected error in red", () => {
      printError(new Error(testErrorMessage))

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("[31mUnexpected internal error"))
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`[31m${testErrorMessage}`))
    })

    it("prints an unexpected error in its own colors, if it is already styled", () => {
      printError(new Error(`\u0033[1;32m${testErrorMessage}`))

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("[31mUnexpected internal error"))
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`[1;32m${testErrorMessage}`))
    })

    it("prints an unexpected error's stack trace, if available", () => {
      const err = new Error(testErrorMessage)
      printError(err)

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(err.stack))
    })

    it("prints an unexpected error's AST node, if available", () => {
      const err = new Error(testErrorMessage)
      err.astNode = { op: "foo" }
      printError(err)

      expect(debugSpy).toHaveBeenCalledWith(err.astNode, expect.any(Boolean), expect.any(Boolean))
    })

    it("prints a parse error, if requested", () => {
      printError({
        token: testToken,
        message: testErrorMessage
      }, true)

      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining("[31m"))
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining("Parse error"))
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining(`${testToken.lineNum}`))
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringContaining(testErrorMessage))
      expect(debugSpy).toHaveBeenLastCalledWith(testToken, expect.any(Boolean), expect.any(Boolean))
    })

    it("doesn't print a parse error, if not requested", () => {
      printError({
        token: testToken,
        message: testErrorMessage
      })

      expect(consoleErrorSpy).not.toHaveBeenCalled()
      expect(consoleLogSpy).not.toHaveBeenCalled()
      expect(debugSpy).not.toHaveBeenCalled()
    })
  })

  describe("printParseError()", () => {
    const templateSrcLines = [
      "",  // dummy line to paper past 0-based/1-based differences; will be trimmed away
      "Desire is a lovestruck ladykiller",
      "My world is nothing",
      "Fire is ice",
      "Hate is water",
      "Rain is purple"
    ]

    it("prints the error message in red, with the line number", () => {
      printParseError(testErrorMessage, testToken, "foo")

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("[31m"))
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("Parse error"))
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`${testToken.lineNum}`))
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(testErrorMessage))
    })

    it("prints up to 3 prelude lines, and the line containing the error", () => {
      for (let errorOnLineNum = 1; errorOnLineNum < templateSrcLines.length; errorOnLineNum++) {
        const srcLines = templateSrcLines.slice()
        srcLines[errorOnLineNum] = `blargh ${srcLines[errorOnLineNum]}`
        const src = srcLines.join("\n").trimLeft()
        const token = { colNum: 1, lineNum: errorOnLineNum }

        printParseError(testErrorMessage, token, src)

        const lineCount = (errorOnLineNum <= 4) ? errorOnLineNum : 4
        const firstSrcLineNum = (errorOnLineNum <= 4) ? 1 : errorOnLineNum - 3

        for (let lineNum = 1; lineNum <= lineCount; lineNum++) {
          const callNum = lineNum + 1  // because of the error message printed before the src line(s)
          const srcLineNum = firstSrcLineNum + lineNum - 1
          expect(consoleErrorSpy).toHaveBeenNthCalledWith(callNum, expect.stringContaining(`${srcLineNum}:`))
          expect(consoleErrorSpy).toHaveBeenNthCalledWith(callNum, expect.stringContaining(srcLines[srcLineNum]))
        }

        consoleErrorSpy.mockClear()
      }
    })

    it("prints a caret under the errant token", () => {
      const src = "Midnight takes your heart and WAS your soul"
      const token = { colNum: 31, lineNum: 1 }

      printParseError(testErrorMessage, token, src)

      const dashCount = token.colNum + 2  // add dashes for "1: ", then map 1-based to 0-based
      const re = new RegExp(`[^-]-{${dashCount}}[^-]*\\^`)
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringMatching(re))
    })

    it("prints a caret under the errant token, even if the source line wraps", () => {
      const terminalColumns = 20
      const originalTerminalColumns = process.stderr.columns
      process.stderr.columns = terminalColumns

      const src = "Midnight takes your heart and WAS your soul"
      const token = { colNum: 31, lineNum: 1 }

      printParseError(testErrorMessage, token, src)

      const dashCount = (token.colNum % terminalColumns) + 2  // add dashes for "1: ", then map 1-based to 0-based
      const re = new RegExp(`[^-]-{${dashCount}}[^-]*\\^`)
      expect(consoleErrorSpy).toHaveBeenLastCalledWith(expect.stringMatching(re))

      process.stderr.columns = originalTerminalColumns
    })

    it("prints dots in place of control characters", () => {
      const src = "Midnight\ttakes\0your\x7Fheart\x0Band\x1BWAS\x80your\x9Fsoul"
      const token = { colNum: 31, lineNum: 1 }

      printParseError(testErrorMessage, token, src)

      const loggedSrc = consoleErrorSpy.mock.calls[1][0].replace(/\x1b\[[0-9;]+m/g, "")  // eslint-disable-line no-control-regex
      expect(loggedSrc).toEqual(expect.stringContaining("1: Midnight·takes·your·heart·and·WAS·your·soul"))
    })
  })
})
