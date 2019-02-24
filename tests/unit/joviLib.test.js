const { generate } = require("../../lib/generators/javascript")
const { readRockstarFiles, readRockstarFile, writeTextFiles } = require("../../lib/utils/fileIO")
const { parse } = require("../../lib/parser")
const { printParseError } = require("../../lib/utils/errorReporter")
const { tokenize } = require("../../lib/tokenizer")
const interpreter = require("../../lib/interpreter")
const joviLib = require("../../lib/joviLib")

jest.mock("../../lib/generators/javascript.js")
jest.mock("../../lib/utils/fileIO.js")
jest.mock("../../lib/parser.js")
jest.mock("../../lib/utils/errorReporter.js")
jest.mock("../../lib/tokenizer.js")
jest.mock("../../lib/interpreter.js")

const mockFilePaths = ["/some/file.rock", "another/file.rock"]
const mockSrc = 'Say "hello world"'
const mockTokens = []
const mockAST = { root: {} }
const mockErrorMessage = "oh gosh darn it"

describe("joviLib", () => {
  beforeEach(() => {
    generate.mockImplementation(() => "console.log('something')")
    readRockstarFiles.mockImplementation(() => mockSrc)
    readRockstarFile.mockImplementation(() => mockSrc)
    tokenize.mockImplementation(() => mockTokens)
    parse.mockImplementation(() => mockAST)
  })

  describe("execute()", () => {
    it("reads and executes one file", () => {
      const mockFilePath = mockFilePaths[0]
      joviLib.execute(mockFilePath)

      expect(readRockstarFiles).toHaveBeenCalledWith([mockFilePath])
      expect(tokenize).toHaveBeenCalledWith(mockSrc)
      expect(parse).toHaveBeenCalledWith(mockTokens)
      expect(interpreter.execute).toHaveBeenCalledWith(mockAST)
    })

    it("reads and executes multiple files", () => {
      joviLib.execute(mockFilePaths)

      expect(readRockstarFiles).toHaveBeenCalledWith(mockFilePaths)
      expect(tokenize).toHaveBeenCalledWith(mockSrc)
      expect(parse).toHaveBeenCalledWith(mockTokens)
      expect(interpreter.execute).toHaveBeenCalledWith(mockAST)

      expect(tokenize).toHaveBeenCalledTimes(1)
      expect(parse).toHaveBeenCalledTimes(1)
      expect(interpreter.execute).toHaveBeenCalledTimes(1)
    })

    it("displays a parser error", () => {
      parse.mockImplementation(() => {
        throw { message: mockErrorMessage, token: {} }
      })

      expect(() => joviLib.execute(mockFilePaths)).toThrow(mockErrorMessage)
      expect(printParseError).toHaveBeenCalled()
    })

    it("doesn't display an unexpected internal error", () => {
      parse.mockImplementation(() => {
        throw new Error(mockErrorMessage)
      })

      expect(() => joviLib.execute(mockFilePaths)).toThrow(mockErrorMessage)
      expect(printParseError).not.toHaveBeenCalled()
    })
  })

  describe("executeCode()", () => {
    it("executes the code", () => {
      joviLib.executeCode(mockSrc)

      expect(tokenize).toHaveBeenCalledWith(mockSrc)
      expect(parse).toHaveBeenCalledWith(mockTokens)
      expect(interpreter.execute).toHaveBeenCalledWith(mockAST)
    })

    it("displays a parser error", () => {
      parse.mockImplementation(() => {
        throw { message: mockErrorMessage, token: {} }
      })

      expect(() => joviLib.executeCode(mockSrc)).toThrow(mockErrorMessage)
      expect(printParseError).toHaveBeenCalled()
    })

    it("doesn't display an unexpected internal error", () => {
      parse.mockImplementation(() => {
        throw new Error(mockErrorMessage)
      })

      expect(() => joviLib.executeCode(mockSrc)).toThrow(mockErrorMessage)
      expect(printParseError).not.toHaveBeenCalled()
    })
  })

  describe("canConvertTo()", () => {
    it("returns true for a language we can convert to", () => {
      expect(joviLib.canConvertTo("js")).toBe(true)
      expect(joviLib.canConvertTo("javascript")).toBe(true)
    })

    it("returns false for a language we can't convert to", () => {
      expect(joviLib.canConvertTo("blargh")).toBe(false)
    })
  })

  describe("convert()", () => {
    it("reads and converts one file independently", () => {
      const mockFilePath = mockFilePaths[0]
      joviLib.convert(mockFilePath, "js")

      expect(readRockstarFile).toHaveBeenCalledWith(mockFilePath, expect.any(Boolean))
      expect(tokenize).toHaveBeenCalledWith(mockSrc)
      expect(parse).toHaveBeenCalledWith(mockTokens)
      expect(generate).toHaveBeenCalledWith(mockAST)
      expect(writeTextFiles).toHaveBeenCalledTimes(1)
    })

    it("reads and converts one file in a bundle", () => {
      const mockFilePath = mockFilePaths[0]
      const bundlePath = "foo.js"
      joviLib.convert(mockFilePath, "js", { bundlePath })

      expect(readRockstarFiles).toHaveBeenCalledWith([mockFilePath], expect.any(Boolean))
      expect(tokenize).toHaveBeenCalledWith(mockSrc)
      expect(parse).toHaveBeenCalledWith(mockTokens)
      expect(generate).toHaveBeenCalledWith(mockAST)
      expect(writeTextFiles).toHaveBeenCalledWith(expect.objectContaining({ [bundlePath]: expect.any(String) }), expect.any(Boolean), expect.any(Boolean))

      expect(tokenize).toHaveBeenCalledTimes(1)
      expect(parse).toHaveBeenCalledTimes(1)
      expect(generate).toHaveBeenCalledTimes(1)
      expect(writeTextFiles).toHaveBeenCalledTimes(1)
    })

    it("reads and converts multiple files independently", () => {
      joviLib.convert(mockFilePaths, "js")

      expect(readRockstarFile).toHaveBeenCalledWith(mockFilePaths[0], expect.any(Boolean))
      expect(readRockstarFile).toHaveBeenCalledWith(mockFilePaths[1], expect.any(Boolean))
      expect(tokenize).toHaveBeenCalledWith(mockSrc)
      expect(parse).toHaveBeenCalledWith(mockTokens)
      expect(generate).toHaveBeenCalledWith(mockAST)

      expect(tokenize).toHaveBeenCalledTimes(mockFilePaths.length)
      expect(parse).toHaveBeenCalledTimes(mockFilePaths.length)
      expect(generate).toHaveBeenCalledTimes(mockFilePaths.length)
      expect(writeTextFiles).toHaveBeenCalledTimes(1)
    })

    it("reads and converts multiple files in a bundle", () => {
      const bundlePath = "foo.js"
      joviLib.convert(mockFilePaths, "js", { bundlePath })

      expect(readRockstarFiles).toHaveBeenCalledWith(mockFilePaths, expect.any(Boolean))
      expect(tokenize).toHaveBeenCalledWith(mockSrc)
      expect(parse).toHaveBeenCalledWith(mockTokens)
      expect(generate).toHaveBeenCalledWith(mockAST)
      expect(writeTextFiles).toHaveBeenCalledWith(expect.objectContaining({ [bundlePath]: expect.any(String) }), expect.any(Boolean), expect.any(Boolean))

      expect(readRockstarFiles).toHaveBeenCalledTimes(1)
      expect(tokenize).toHaveBeenCalledTimes(1)
      expect(parse).toHaveBeenCalledTimes(1)
      expect(generate).toHaveBeenCalledTimes(1)
      expect(writeTextFiles).toHaveBeenCalledTimes(1)
    })

    it("automatically overwrites files, if requested", () => {
      joviLib.convert(mockFilePaths, "js", { overwrite: true })
      expect(writeTextFiles).toHaveBeenCalledWith(expect.any(Object), true, expect.any(Boolean))
    })

    it("doesn't automatically overwrite files, if not requested", () => {
      joviLib.convert(mockFilePaths, "js", { overwrite: false })
      expect(writeTextFiles).toHaveBeenCalledWith(expect.any(Object), false, expect.any(Boolean))
    })

    it("displays paths/names of files read and written, if requested", () => {
      joviLib.convert(mockFilePaths, "js", { verbose: true })
      expect(readRockstarFile).toHaveBeenCalledWith(expect.any(String), true)
      expect(writeTextFiles).toHaveBeenCalledWith(expect.any(Object), expect.any(Boolean), true)

      joviLib.convert(mockFilePaths, "js", { verbose: true, bundlePath: "foo.js" })
      expect(readRockstarFiles).toHaveBeenCalledWith(expect.any(Object), true)
      expect(writeTextFiles).toHaveBeenCalledWith(expect.any(Object), expect.any(Boolean), true)
    })

    it("doesn't display paths/names of files read and written, if not requested", () => {
      joviLib.convert(mockFilePaths, "js", { verbose: false })
      expect(readRockstarFile).toHaveBeenCalledWith(expect.any(String), false)
      expect(writeTextFiles).toHaveBeenCalledWith(expect.any(Object), expect.any(Boolean), false)

      joviLib.convert(mockFilePaths, "js", { verbose: false, bundlePath: "foo.js" })
      expect(readRockstarFiles).toHaveBeenCalledWith(expect.any(Object), false)
      expect(writeTextFiles).toHaveBeenCalledWith(expect.any(Object), expect.any(Boolean), false)
    })

    it("throws an exception if we can't convert to the requested language", () => {
      expect(() => joviLib.convert(mockFilePaths, "blargh")).toThrow()
    })

    it("displays a parser error", () => {
      parse.mockImplementation(() => {
        throw { message: mockErrorMessage, token: {} }
      })

      expect(() => joviLib.convert(mockFilePaths, "js")).toThrow(mockErrorMessage)
      expect(printParseError).toHaveBeenCalled()
    })

    it("doesn't display an unexpected internal error", () => {
      parse.mockImplementation(() => {
        throw new Error(mockErrorMessage)
      })

      expect(() => joviLib.convert(mockFilePaths, "js")).toThrow(mockErrorMessage)
      expect(printParseError).not.toHaveBeenCalled()
    })
  })

  describe("convertCode()", () => {
    it("converts the code", () => {
      joviLib.convertCode(mockSrc, "js")

      expect(tokenize).toHaveBeenCalledWith(mockSrc)
      expect(parse).toHaveBeenCalledWith(mockTokens)
      expect(generate).toHaveBeenCalledWith(mockAST)
    })

    it("throws an exception if we can't convert to the requested language", () => {
      expect(() => joviLib.convertCode(mockSrc, "blargh")).toThrow()
    })

    it("displays a parser error", () => {
      parse.mockImplementation(() => {
        throw { message: mockErrorMessage, token: {} }
      })

      expect(() => joviLib.convertCode(mockSrc, "js")).toThrow(mockErrorMessage)
      expect(printParseError).toHaveBeenCalled()
    })

    it("doesn't display an unexpected internal error", () => {
      parse.mockImplementation(() => {
        throw new Error(mockErrorMessage)
      })

      expect(() => joviLib.convertCode(mockSrc, "js")).toThrow(mockErrorMessage)
      expect(printParseError).not.toHaveBeenCalled()
    })
  })
})
