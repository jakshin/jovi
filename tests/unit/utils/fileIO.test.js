jest.mock("fs")  // must be first, or Jest v23 breaks (https://github.com/facebook/jest/issues/4563)

const { readRockstarFiles, readRockstarFile, writeTextFiles } = require("../../../lib/utils/fileIO")
const fs = require("fs")

describe("fileIO", () => {
  const testFilePaths = ["foo.rock", "/path/to/bar.rock", "söme påth/foo [Bar] BAZ.rock"]
  const testSrc = "Desire is a lovestruck ladykiller"
  let consoleSpy, readSpy, writeSpy

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {})
  })

  describe("readRockstarFiles()", () => {
    beforeEach(() => {
      readSpy = jest.spyOn(fs, "readFileSync").mockImplementation(() => testSrc)
    })

    it("reads every file passed", () => {
      readRockstarFiles(testFilePaths)
      for (const testFilePath of testFilePaths) {
        expect(readSpy).toHaveBeenCalledWith(testFilePath, "utf8")
      }
    })

    it("separates each file read with an EOF marker", () => {
      const src = readRockstarFiles(testFilePaths)
      expect(src.replace(/\n/g, "")).toBe(`${testSrc}⏎${testSrc}⏎${testSrc}`)  // no ⏎ at end of last file
    })

    it("is verbose, if requested", () => {
      readRockstarFiles(testFilePaths, true)
      for (const testFilePath of testFilePaths) {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(String), expect.stringContaining(testFilePath))
      }
    })

    it("isn't verbose, if not requested", () => {
      readRockstarFiles(testFilePaths)
      expect(consoleSpy).not.toHaveBeenCalled()
    })

    // we don't do detailed tests of symlink/permission things here,
    // because we test those for readRockstarFile() and readRockstarFiles() calls it
  })

  describe("readRockstarFile()", () => {
    const testFilePath = testFilePaths.slice(-1)[0]

    beforeEach(() => {
      readSpy = jest.spyOn(fs, "readFileSync").mockImplementation(() => testSrc)
    })

    it("reads the passed file from disk", () => {
      const src = readRockstarFile(testFilePath)
      expect(readSpy).toHaveBeenCalledWith(testFilePath, "utf8")
      expect(src).toEqual(expect.stringContaining(testSrc))
    })

    it("throws if the file can't be read", () => {
      readSpy.mockImplementation(() => {
        throw new Error("bummer")
      })

      try {
        readRockstarFile(testFilePath)
        fail("Expected readRockstarFile() to throw, but it didn't")
      }
      catch (err) {
        expect(err).not.toEqual(expect.any(Error))
        expect(err.message).toBe("bummer")
        expect(err.filePath).toBe(testFilePath)
        expect(err.operation).toBe("read")
        expect(err.cause).toEqual(expect.any(Error))
      }
    })

    it("normalizes linebreaks in the file", () => {
      readSpy.mockImplementation(() => 'If Midnight is nothing\rSay "Buzz!"\r\nTake it to the top')
      const src = readRockstarFile(testFilePath)
      expect(src).toBe('If Midnight is nothing\nSay "Buzz!"\nTake it to the top\n')
    })

    it("removes a shebang line from the file, if present", () => {
      readSpy.mockImplementation(() => `#!/bin/jovi\r\n${testSrc}`)
      const src = readRockstarFile(testFilePath)
      expect(src).toBe(`${testSrc}\n`)
    })

    it("is verbose, if requested", () => {
      readRockstarFile(testFilePath, true)
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(String), expect.stringContaining(testFilePath))
    })

    it("isn't verbose, if not requested", () => {
      readRockstarFile(testFilePath)
      expect(consoleSpy).not.toHaveBeenCalled()
    })
  })

  describe("writeTextFiles()", () => {
    const testFiles = {
      "foo.rock": "foo",
      "path/to/bar.rock": "bar",
      "/some path/foo Bar BAZ.rock": "foo Bar BAZ"
    }

    beforeEach(() => {
      writeSpy = jest.spyOn(fs, "writeFileSync").mockImplementation(() => {})
    })

    it("writes every file passed", () => {
      writeTextFiles(testFiles)
      for (const testFilePath in testFiles) {
        const testFileContent = testFiles[testFilePath]
        expect(writeSpy).toHaveBeenCalledWith(testFilePath, testFileContent, expect.any(Object))
      }
    })

    it("overwrites existing files, if requested", () => {
      writeTextFiles(testFiles, true)
      for (const testFilePath in testFiles) {
        expect(writeSpy).toHaveBeenCalledWith(testFilePath, expect.any(String), expect.objectContaining({ flag: "w" }))
      }
    })

    it("doesn't overwrite existing files, if not requested", () => {
      writeTextFiles(testFiles, false)
      for (const testFilePath in testFiles) {
        expect(writeSpy).toHaveBeenCalledWith(testFilePath, expect.any(String), expect.objectContaining({ flag: "wx" }))
      }
    })

    it("is verbose", () => {
      writeTextFiles(testFiles)
      for (const testFilePath in testFiles) {
        expect(consoleSpy).toHaveBeenCalledWith(expect.any(String), expect.stringContaining(testFilePath))
      }
    })
  })
})
