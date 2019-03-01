const testWithFixture = require("./fixtureUtils/testWithFixture")

describe("decrement", () => {
  test("decrement.rock converted to JS", () => testWithFixture("decrement/decrement.rock", "JS"))
  test("decrementBooleanLiteral.rock converted to JS", () => testWithFixture("decrement/decrementBooleanLiteral.rock", "JS"))
  test("decrementFloatLiteral.rock converted to JS", () => testWithFixture("decrement/decrementFloatLiteral.rock", "JS"))
  test("decrementIntegerLiteral.rock converted to JS", () => testWithFixture("decrement/decrementIntegerLiteral.rock", "JS"))
  test("decrementMysteriousLiteral.rock converted to JS", () => testWithFixture("decrement/decrementMysteriousLiteral.rock", "JS"))
  test("decrementMysteriousVariable.rock converted to JS", () => testWithFixture("decrement/decrementMysteriousVariable.rock", "JS"))
  test("decrementNullLiteral.rock converted to JS", () => testWithFixture("decrement/decrementNullLiteral.rock", "JS"))
  test("decrementStringLiteral.rock converted to JS", () => testWithFixture("decrement/decrementStringLiteral.rock", "JS"))
  test("decrementStringVariable.rock converted to JS", () => testWithFixture("decrement/decrementStringVariable.rock", "JS"))
})

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
