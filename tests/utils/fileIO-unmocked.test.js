const { readRockstarFile, writeTextFiles } = require("../../lib/utils/fileIO")
const fs = require("fs")
const path = require("path")
const removeSync = require("fs-extra").removeSync
const terminalIO = require("../../lib/utils/terminalIO")
const tmp = require("tmp")

jest.mock("../../lib/utils/terminalIO.js")

describe("fileIO", () => {
  const tmpsToDelete = []
  const testSrc = "Desire is a lovestruck ladykiller\n"

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {})
  })
  afterAll(() => {
    for (const tmpToDelete of tmpsToDelete) {
      removeSync(tmpToDelete)
    }
  })

  describe("readRockstarFiles()", () => {
    // we don't bother to do unmocked tests of symlink/permission things here,
    // because we test those for readRockstarFile() and readRockstarFiles() calls it
  })

  describe("readRockstarFile()", () => {
    it("works when the path/filename contains weird characters", () => {
      // create a weird dir in $TMPDIR, create a weird file in it, call readRockstarFile(), check
      const dirPath = tmp.dirSync({ prefix: "驚くばかり" }).name
      const filePath = path.join(dirPath, "• ∫îll¥ \t ƒílè \r nåµë")
      tmpsToDelete.push(dirPath)

      fs.writeFileSync(filePath, testSrc)

      const src = readRockstarFile(filePath)
      expect(src).toBe(testSrc)
    })

    it("works when the file is a symlink", () => {
      // create a file in $TMPDIR, symlink it, call readRockstarFile() on the symlink, check
      const filePath = tmp.fileSync().name
      const linkPath = tmp.tmpNameSync()
      tmpsToDelete.push(filePath, linkPath)

      fs.symlinkSync(filePath, linkPath)
      fs.writeFileSync(filePath, testSrc)

      const src = readRockstarFile(linkPath)
      expect(src).toBe(testSrc)
    })

    it("works when the file's parent directory is a symlink", () => {
      // create a path in $TMPDIR, symlink it, create a file in it, call readRockstarFile() using the symlink, check
      const dirPath = tmp.dirSync().name
      const linkPath = tmp.tmpNameSync()
      const filePath = path.join(linkPath, "foo.rock")
      tmpsToDelete.push(dirPath, linkPath)

      fs.symlinkSync(dirPath, linkPath)
      fs.writeFileSync(filePath, testSrc)

      const src = readRockstarFile(filePath)
      expect(src).toBe(testSrc)
    })

    it("throws when the file doesn't exist", () => {
      // call readRockstarFile() on a non-existent file in $TMPDIR, check
      const badPath = tmp.tmpNameSync()

      try {
        readRockstarFile(badPath)
        fail("Expected readRockstarFile() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "no such file or directory", "read", badPath)
      }
    })

    it("throws when the path doesn't exist", () => {
      // call readRockstarFile() on a file in a non-existent path in $TMPDIR, check
      const badPath = path.join(tmp.tmpNameSync(), "not-there.rock")

      try {
        readRockstarFile(badPath)
        fail("Expected readRockstarFile() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "no such file or directory", "read", badPath)
      }
    })

    it("throws when the file is actually a directory", () => {
      // call readRockstarFile() on a directory in $TMPDIR, check
      const dirPath = tmp.dirSync().name
      tmpsToDelete.push(dirPath, dirPath)

      try {
        readRockstarFile(dirPath)
        fail("Expected readRockstarFile() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "illegal operation on a directory", "read", dirPath)
      }
    })

    it("throws when permissions prevent the file from being read", () => {
      // create a file in $TMPDIR, alter its permissions, call readRockstarFile(), check
      const filePath = tmp.fileSync({ postfix: ".rock" }).name
      tmpsToDelete.push(filePath)

      fs.writeFileSync(filePath, testSrc)
      fs.chmodSync(filePath, 0o000)

      try {
        readRockstarFile(filePath)
        fail("Expected readRockstarFile() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "permission denied", "read", filePath)
      }
    })

    it("throws when parent directory permissions prevent the file from being read", () => {
      // create a path in $TMPDIR, create a file in it, alter path permissions, call readRockstarFile(), check
      const dirPath = tmp.dirSync().name
      const filePath = tmp.fileSync({ dir: dirPath, postfix: ".rock" }).name
      tmpsToDelete.push(dirPath)

      fs.writeFileSync(filePath, testSrc)
      fs.chmodSync(dirPath, 0o000)

      try {
        readRockstarFile(filePath)
        fail("Expected readRockstarFile() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "permission denied", "read", filePath)
      }
      finally {
        fs.chmodSync(dirPath, 0o777)  // so we can delete it in afterAll()
      }
    })
  })

  describe("writeTextFiles()", () => {
    const canaryText = "canary"
    const testText = "this is Jason's \"favorite\" \\test \n string"

    beforeEach(() => {
      terminalIO.prompt.mockImplementation(() => "y")
    })

    it("works when the path/filename or text contains weird characters", () => {
      const dirPath = tmp.dirSync({ prefix: "驚くばかり" }).name
      const filePath = path.join(dirPath, "• ∫îll¥ \t ƒílè \r nåµë")
      tmpsToDelete.push(dirPath)

      writeTextFiles({
        [filePath]: filePath
      })

      expect(fs.readFileSync(filePath, "utf8")).toBe(filePath)
    })

    it("throws when the path doesn't exist", () => {
      const dirPath = tmp.tmpNameSync()
      const filePath = path.join(dirPath, "foo.rock")

      try {
        writeTextFiles({
          [filePath]: testText
        })
        fail("Expected writeTextFiles() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "no such file or directory", "write", filePath)
      }
    })

    it("works when the file exists as a device", () => {
      const filePath = "/dev/null"

      writeTextFiles({
        [filePath]: testText
      })

      expect()  // if we get here without crashing, we're good
    })

    it("throws when the file exists as directory", () => {
      const dirPath = tmp.dirSync().name
      tmpsToDelete.push(dirPath)

      try {
        writeTextFiles({
          [dirPath]: testText
        })
        fail("Expected writeTextFiles() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "illegal operation on a directory", "write", dirPath)
      }
    })

    it("works when the file exists as valid symlink", () => {
      // we expect the symlink target to be overwritten
      const filePath = tmp.fileSync().name
      const linkPath = tmp.tmpNameSync()
      tmpsToDelete.push(filePath, linkPath)

      fs.symlinkSync(filePath, linkPath)
      fs.writeFileSync(filePath, canaryText)

      writeTextFiles({
        [linkPath]: testText
      })

      expect(fs.readFileSync(filePath, "utf8")).toBe(testText)
    })

    it("throws when the file exists as a symlink to nowhere", () => {
      const filePath = tmp.tmpNameSync()  // doesn't exist
      const linkPath = tmp.tmpNameSync()
      tmpsToDelete.push(linkPath)

      fs.symlinkSync(filePath, linkPath)

      try {
        writeTextFiles({
          [linkPath]: testText
        })
        fail("Expected writeTextFiles() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "file already exists", "write", linkPath)  // deceptive error message, but out of our control
      }
    })

    it("throws when the file exists as a symlink to a directory", () => {
      const dirPath = tmp.dirSync().name
      const linkPath = tmp.tmpNameSync()
      tmpsToDelete.push(dirPath, linkPath)

      fs.symlinkSync(dirPath, linkPath)

      try {
        writeTextFiles({
          [linkPath]: testText
        })
        fail("Expected writeTextFiles() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "illegal operation on a directory", "write", linkPath)
      }
    })

    it("works when the file's parent directory is a symlink", () => {
      const dirPath = tmp.dirSync().name
      const linkPath = tmp.tmpNameSync()
      const filePath = path.join(linkPath, "foo.txt")
      tmpsToDelete.push(dirPath, linkPath)

      fs.symlinkSync(dirPath, linkPath)

      writeTextFiles({
        [filePath]: testText
      })

      expect(fs.readFileSync(filePath, "utf8")).toBe(testText)
    })

    it("throws when the file's parent directory is a symlink to nowhere", () => {
      const dirPath = tmp.tmpNameSync()  // doesn't exist
      const linkPath = tmp.tmpNameSync()
      const filePath = path.join(linkPath, "foo.txt")
      tmpsToDelete.push(linkPath)

      fs.symlinkSync(dirPath, linkPath)

      try {
        writeTextFiles({
          [filePath]: testText
        })
        fail("Expected writeTextFiles() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "no such file or directory", "write", filePath)
      }
    })

    it("throws when permissions prevent the file from being written", () => {
      const filePath = tmp.fileSync().name
      tmpsToDelete.push(filePath)

      fs.chmodSync(filePath, 0o000)

      try {
        writeTextFiles({
          [filePath]: testText
        })
        fail("Expected writeTextFiles() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "permission denied", "write", filePath)
      }
    })

    it("throws when parent directory permissions prevent the file from being written", () => {
      const dirPath = tmp.dirSync().name
      const filePath = tmp.tmpNameSync({ dir: dirPath })
      tmpsToDelete.push(dirPath)

      fs.chmodSync(dirPath, 0o000)

      try {
        writeTextFiles({
          [filePath]: testText
        })
        fail("Expected readRockstarFile() to throw, but it didn't")
      }
      catch (err) {
        checkThrownError(err, "permission denied", "write", filePath)
      }
    })

    describe("when running in a TTY", () => {
      const originalIsTTY = process.stdin.isTTY

      beforeEach(() => {
        process.stdin.isTTY = true
      })
      afterEach(() => {
        process.stdin.isTTY = originalIsTTY
      })

      it("automatically overwrites an existing file, if overwrite = true", () => {
        const filePath = tmp.fileSync().name
        tmpsToDelete.push(filePath)

        fs.writeFileSync(filePath, canaryText)
        expect(fs.readFileSync(filePath, "utf8")).toBe(canaryText)  // sanity check

        writeTextFiles({ [filePath]: testText }, true)
        expect(fs.readFileSync(filePath, "utf8")).toBe(testText)
        expect(terminalIO.prompt).not.toHaveBeenCalled()
      })

      it("prompts the user whether to overwrite an existing file, if overwrite = false", () => {
        terminalIO.prompt.mockImplementation(() => "n")

        const filePath = tmp.fileSync().name
        tmpsToDelete.push(filePath)

        fs.writeFileSync(filePath, canaryText)

        writeTextFiles({ [filePath]: testText })
        expect(terminalIO.prompt).toHaveBeenCalledWith(expect.stringContaining(filePath), "ynca")
      })

      it("overwrites the file if the user answers yes", () => {
        terminalIO.prompt.mockImplementation(() => "n").mockImplementationOnce(() => "y")

        const filePath1 = tmp.fileSync().name
        const filePath2 = tmp.fileSync().name
        tmpsToDelete.push(filePath1, filePath2)

        fs.writeFileSync(filePath1, canaryText)
        fs.writeFileSync(filePath2, canaryText)
        expect(fs.readFileSync(filePath1, "utf8")).toBe(canaryText)  // sanity check

        writeTextFiles({ [filePath1]: testText, [filePath2]: testText })

        expect(terminalIO.prompt).toHaveBeenCalledWith(expect.stringContaining(filePath1), expect.any(String))
        expect(terminalIO.prompt).toHaveBeenCalledWith(expect.stringContaining(filePath2), expect.any(String))
        expect(fs.readFileSync(filePath1, "utf8")).toBe(testText)
        expect(fs.readFileSync(filePath2, "utf8")).toBe(canaryText)
      })

      it("overwrites the file and all subsequent files if the user answers all", () => {
        terminalIO.prompt.mockImplementation(() => "a")

        const filePath1 = tmp.fileSync().name
        const filePath2 = tmp.fileSync().name
        tmpsToDelete.push(filePath1, filePath2)

        fs.writeFileSync(filePath1, canaryText)
        fs.writeFileSync(filePath2, canaryText)
        expect(fs.readFileSync(filePath1, "utf8")).toBe(canaryText)  // sanity check
        expect(fs.readFileSync(filePath2, "utf8")).toBe(canaryText)  // sanity check

        writeTextFiles({ [filePath1]: testText, [filePath2]: testText })

        expect(terminalIO.prompt).toHaveBeenCalledWith(expect.stringContaining(filePath1), expect.any(String))
        expect(terminalIO.prompt).toHaveBeenCalledTimes(1)
        expect(fs.readFileSync(filePath1, "utf8")).toBe(testText)
        expect(fs.readFileSync(filePath2, "utf8")).toBe(testText)
      })

      it("skips the file without overwriting if the user answers no", () => {
        terminalIO.prompt.mockImplementation(() => "n")

        const filePath1 = tmp.fileSync().name
        const filePath2 = tmp.fileSync().name
        tmpsToDelete.push(filePath1, filePath2)

        fs.writeFileSync(filePath1, canaryText)
        fs.writeFileSync(filePath2, canaryText)

        writeTextFiles({ [filePath1]: testText, [filePath2]: testText })

        expect(terminalIO.prompt).toHaveBeenCalledWith(expect.stringContaining(filePath1), expect.any(String))
        expect(terminalIO.prompt).toHaveBeenCalledWith(expect.stringContaining(filePath2), expect.any(String))
        expect(fs.readFileSync(filePath1, "utf8")).toBe(canaryText)
        expect(fs.readFileSync(filePath2, "utf8")).toBe(canaryText)
      })

      it("aborts if the user answers cancel", () => {
        terminalIO.prompt.mockImplementation(() => "c")

        const filePath1 = tmp.fileSync().name
        const filePath2 = tmp.fileSync().name
        tmpsToDelete.push(filePath1, filePath2)

        fs.writeFileSync(filePath1, canaryText)
        fs.writeFileSync(filePath2, canaryText)

        writeTextFiles({ [filePath1]: testText, [filePath2]: testText })

        expect(terminalIO.prompt).toHaveBeenCalledWith(expect.stringContaining(filePath1), expect.any(String))
        expect(terminalIO.prompt).toHaveBeenCalledTimes(1)
        expect(fs.readFileSync(filePath1, "utf8")).toBe(canaryText)
        expect(fs.readFileSync(filePath2, "utf8")).toBe(canaryText)
      })
    })

    describe("when not running in a TTY", () => {
      const originalIsTTY = process.stdin.isTTY

      beforeEach(() => {
        process.stdin.isTTY = false
      })
      afterEach(() => {
        process.stdin.isTTY = originalIsTTY
      })

      it("automatically overwrites an existing file, if overwrite = true", () => {
        const filePath = tmp.fileSync().name
        tmpsToDelete.push(filePath)

        fs.writeFileSync(filePath, canaryText)
        expect(fs.readFileSync(filePath, "utf8")).toBe(canaryText)  // sanity check

        writeTextFiles({ [filePath]: testText }, true)
        expect(fs.readFileSync(filePath, "utf8")).toBe(testText)
      })

      it("aborts on the first existing file, if overwrite = false", () => {
        const filePath1 = tmp.tmpNameSync()  // file doesn't exist
        const filePath2 = tmp.fileSync().name
        const filePath3 = tmp.fileSync().name
        tmpsToDelete.push(filePath1, filePath2, filePath3)

        fs.writeFileSync(filePath2, canaryText)
        fs.writeFileSync(filePath3, canaryText)
        const writeSpy = jest.spyOn(fs, "writeFileSync")

        try {
          writeTextFiles({
            [filePath1]: testText,  // should work because file doesn't exist
            [filePath2]: testText,  // should throw because file exists
            [filePath3]: testText   // shouldn't even try to write this one
          })
          fail("Expected writeTextFiles() to throw, but it didn't")
        }
        catch (err) {
          expect(fs.readFileSync(filePath1, "utf8")).toBe(testText)
          expect(fs.readFileSync(filePath2, "utf8")).toBe(canaryText)
          expect(fs.readFileSync(filePath3, "utf8")).toBe(canaryText)

          expect(writeSpy).toHaveBeenCalledWith(filePath1, expect.any(String), expect.any(Object))
          expect(writeSpy).toHaveBeenCalledWith(filePath2, expect.any(String), expect.any(Object))
          expect(writeSpy).not.toHaveBeenCalledWith(filePath3, expect.any(String), expect.any(Object))
        }
      })
    })
  })
})

// checks the properties of an error thrown by readRockstarFile() or writeTextFiles()
function checkThrownError(err, expectedMessage, expectedOperation, expectedFilePath) {
  expect(err).not.toEqual(expect.any(Error))
  expect(err.message).toBe(expectedMessage)
  expect(err.operation).toBe(expectedOperation)
  expect(err.filePath).toBe(expectedFilePath)

  // `instanceof` is janky against global native types under Jest because sandboxing
  // (see https://github.com/facebook/jest/issues/2549 for some background info),
  // and `err.cause instanceof Error` doesn't work as expected here, so we do this instead
  expect(err.cause.constructor.name).toBe("Error")
}
