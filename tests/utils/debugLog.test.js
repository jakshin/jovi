const debugLog = require("../../lib/utils/debugLog")
const util = require("util")

describe.only("debugLog", () => {
  const testStr = "foo Bar BAZ"
  const testObj = { test: testStr }
  let consoleSpy, utilSpy

  beforeEach(() => {
    debugLog.opts.enabled = true
    consoleSpy = jest.spyOn(console, "debug").mockImplementation(() => {})
    utilSpy = jest.spyOn(util, "inspect").mockImplementation(() => "blah")
  })

  describe("header()", () => {
    it("prints its argument in white", () => {
      debugLog.header(testStr)
      expect(consoleSpy).toHaveBeenLastCalledWith(expect.stringContaining(testStr))
      expect(consoleSpy).toHaveBeenLastCalledWith(expect.stringMatching(/\[1m.*\[37m/))
    })

    it("prints a blank line after its argument", () => {
      debugLog.header(testStr)
      expect(testStr).not.toEqual(expect.stringMatching(/\n/))  // sanity check
      expect(consoleSpy).toHaveBeenLastCalledWith(expect.stringMatching(/\n/))
    })

    it("does nothing when disabled", () => {
      debugLog.opts.enabled = false
      debugLog.header(testStr)
      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })

  describe("log()", () => {
    it("prints its argument without styling", () => {
      debugLog.log(testStr)
      expect(consoleSpy).toHaveBeenLastCalledWith(expect.stringContaining(testStr))
      expect(consoleSpy).toHaveBeenLastCalledWith(expect.not.stringContaining("\u001B["))
    })

    it("doesn't print a blank line after its argument", () => {
      debugLog.log(testStr)
      expect(testStr).not.toEqual(expect.stringMatching(/\n/))  // sanity check
      expect(consoleSpy).toHaveBeenLastCalledWith(expect.not.stringMatching(/\n/))
    })

    it("does nothing when disabled", () => {
      debugLog.opts.enabled = false
      debugLog.log(testStr)
      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })

  describe("dump()", () => {
    it("prints its argument via util.inspect()", () => {
      debugLog.dump(testObj)
      expect(utilSpy).toHaveBeenLastCalledWith(testObj, expect.objectContaining({
        colors: true,
        depth: null,
        maxArrayLength: null
      }))
    })

    it("uses compact mode, if requested", () => {
      debugLog.dump(testObj)  // 2nd arg defaults to `true`
      expect(utilSpy).toHaveBeenLastCalledWith(testObj, expect.objectContaining({ compact: true }))
    })

    it("doesn't use compact mode, if not requested", () => {
      debugLog.dump(testObj, false)
      expect(utilSpy).toHaveBeenLastCalledWith(testObj, expect.objectContaining({ compact: false }))
    })

    it("prints a blank line before its argument, if requested", () => {
      debugLog.dump(testObj, true, true)
      expect(consoleSpy).toHaveBeenNthCalledWith(1)
      expect(consoleSpy).toHaveBeenCalledTimes(3)
    })

    it("doesn't print a blank line before its argument, if not requested", () => {
      debugLog.dump(testObj, true)  // 3rd arg defaults to `false`
      expect(consoleSpy).not.toHaveBeenNthCalledWith(1)
      expect(consoleSpy).toHaveBeenCalledTimes(2)
    })

    it("prints a blank line after its argument", () => {
      debugLog.dump(testObj)
      expect(consoleSpy).toHaveBeenLastCalledWith()
    })

    it("does nothing when disabled", () => {
      debugLog.opts.enabled = false
      debugLog.dump(testStr)
      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })
})
