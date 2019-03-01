const testWithFixture = require("./fixtureUtils/testWithFixture")

describe("increment", () => {
  test("increment.rock converted to JS", () => testWithFixture("increment/increment.rock", "JS"))
  test("incrementBooleanLiteral.rock converted to JS", () => testWithFixture("increment/incrementBooleanLiteral.rock", "JS"))
  test("incrementFloatLiteral.rock converted to JS", () => testWithFixture("increment/incrementFloatLiteral.rock", "JS"))
  test("incrementIntegerLiteral.rock converted to JS", () => testWithFixture("increment/incrementIntegerLiteral.rock", "JS"))
  test("incrementMysteriousLiteral.rock converted to JS", () => testWithFixture("increment/incrementMysteriousLiteral.rock", "JS"))
  test("incrementMysteriousVariable.rock converted to JS", () => testWithFixture("increment/incrementMysteriousVariable.rock", "JS"))
  test("incrementNullLiteral.rock converted to JS", () => testWithFixture("increment/incrementNullLiteral.rock", "JS"))
  test("incrementStringLiteral.rock converted to JS", () => testWithFixture("increment/incrementStringLiteral.rock", "JS"))
  test("incrementStringVariable.rock converted to JS", () => testWithFixture("increment/incrementStringVariable.rock", "JS"))
})

describe("simple", () => {
  test("hello.rock converted to JS", () => testWithFixture("simple/hello.rock", "JS"))
  test("sayInput.rock converted to JS", () => testWithFixture("simple/sayInput.rock", "JS"))
})
