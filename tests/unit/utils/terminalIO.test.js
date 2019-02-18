const { getTerminalColumns, print, prompt } = require("../../../lib/utils/terminalIO")
const readlineSync = require("readline-sync")

describe("terminalIO", () => {
  describe("getTerminalColumns()", () => {
    it("returns the passed output stream's column count if it is a TTY", () => {
      expect(getTerminalColumns({ isTTY: true, columns: 42 })).toBe(42)
    })

    it("returns Infinity if the passed output stream is not a TTY", () => {
      expect(getTerminalColumns({ isTTY: false, columns: 42 })).toBe(Infinity)
    })

    it("doesn't return a column count greater than the passed cap", () => {
      expect(getTerminalColumns({ isTTY: true, columns: 42 }, 20)).toBe(20)
      expect(getTerminalColumns({ isTTY: false }, 20)).toBe(20)
    })
  })

  describe("print()", () => {
    const testStr = "Hey there, good lookin', what's up?"
    let consoleSpy

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {})
    })

    it("prints a string", () => {
      print(testStr)
      expect(consoleSpy).toHaveBeenCalledWith(testStr)
    })

    it("wraps the string if it's longer than the terminal's width", () => {
      const terminalColumns = 15
      const originalTerminalColumns = process.stdout.columns
      process.stdout.columns = terminalColumns

      print(testStr)
      expect(consoleSpy).toHaveBeenCalledWith("Hey there,")
      expect(consoleSpy).toHaveBeenCalledWith("good lookin',")
      expect(consoleSpy).toHaveBeenCalledWith("what's up?")

      process.stdout.columns = originalTerminalColumns
    })

    it("wraps the string at the specified width, if requested", () => {
      print(testStr, { maxWrapWidth: 15 })
      expect(consoleSpy).toHaveBeenCalledWith("Hey there,")
      expect(consoleSpy).toHaveBeenCalledWith("good lookin',")
      expect(consoleSpy).toHaveBeenCalledWith("what's up?")
    })

    it("prints a blank line after the string, if requested", () => {
      print(testStr, { blankLineAfter: true })
      expect(consoleSpy).toHaveBeenLastCalledWith()
    })

    it("highlights words, if requested", () => {
      // sanity check
      const highlight = "[37m"
      print(testStr)
      expect(consoleSpy).toHaveBeenCalledWith(expect.not.stringContaining(highlight))

      // test
      print(testStr, { highlightWordsMatching: /there/ })
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(`${highlight}there`))
    })
  })

  describe("prompt()", () => {
    const testMsg = "Do you like this?"
    const testAllowedResponseChars = "yn"
    let readlineSpy

    beforeEach(() => {
      readlineSpy = jest.spyOn(readlineSync, "keyIn").mockImplementation(() => "x")
    })

    it("prompts with the passed message", () => {
      prompt(testMsg, testAllowedResponseChars)
      expect(readlineSpy).toHaveBeenLastCalledWith(expect.stringContaining(testMsg), expect.any(Object))
    })

    it("limits the user's response to one of the passed characters", () => {
      prompt(testMsg, testAllowedResponseChars)
      expect(readlineSpy).toHaveBeenLastCalledWith(expect.any(String), expect.objectContaining({
        limit: testAllowedResponseChars
      }))
    })
  })
})
