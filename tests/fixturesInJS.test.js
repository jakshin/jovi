const testWithFixture = require("./fixtureUtils/testWithFixture")

describe("simple", () => {
  test("hello.rock converted to JS", () => testWithFixture("simple/hello.rock", "JS"))
  test("sayInput.rock converted to JS", () => testWithFixture("simple/sayInput.rock", "JS"))
})
