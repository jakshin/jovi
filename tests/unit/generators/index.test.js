const { loadGenerator } = require("../../../lib/generators/index")

describe("loadGenerator()", () => {
  it("returns the generator for known languages", () => {
    expect(loadGenerator("js")).toBeDefined()
    expect(loadGenerator("JavaScript")).toBeDefined()  // case-insensitive
  })

  it("throws an exception when an unknown language generator is requested", () => {
    const unknownLanguage = "blargh"
    expect(() => loadGenerator(unknownLanguage)).toThrow({
      message: expect.any(String),
      language: unknownLanguage,
      cause: expect.any(Object)
    })
  })

  it("throws an exception when an invalid language generator is requested", () => {
    const invalidLanguage = "../foo"
    expect(() => loadGenerator(invalidLanguage)).toThrow({
      message: expect.any(String),
      language: invalidLanguage
    })
  })
})
