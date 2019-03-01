const testWithFixture = require("./fixtureUtils/testWithFixture")

describe("decrement", () => {
  test("decrement.rock", () => testWithFixture("decrement/decrement.rock"))
  test("decrementBooleanLiteral.rock", () => testWithFixture("decrement/decrementBooleanLiteral.rock"))
  test("decrementFloatLiteral.rock", () => testWithFixture("decrement/decrementFloatLiteral.rock"))
  test("decrementIntegerLiteral.rock", () => testWithFixture("decrement/decrementIntegerLiteral.rock"))
  test("decrementMysteriousLiteral.rock", () => testWithFixture("decrement/decrementMysteriousLiteral.rock"))
  test("decrementMysteriousVariable.rock", () => testWithFixture("decrement/decrementMysteriousVariable.rock"))
  test("decrementNullLiteral.rock", () => testWithFixture("decrement/decrementNullLiteral.rock"))
  test("decrementStringLiteral.rock", () => testWithFixture("decrement/decrementStringLiteral.rock"))
  test("decrementStringVariable.rock", () => testWithFixture("decrement/decrementStringVariable.rock"))
})

describe("increment", () => {
  test("increment.rock", () => testWithFixture("increment/increment.rock"))
  test("incrementBooleanLiteral.rock", () => testWithFixture("increment/incrementBooleanLiteral.rock"))
  test("incrementFloatLiteral.rock", () => testWithFixture("increment/incrementFloatLiteral.rock"))
  test("incrementIntegerLiteral.rock", () => testWithFixture("increment/incrementIntegerLiteral.rock"))
  test("incrementMysteriousLiteral.rock", () => testWithFixture("increment/incrementMysteriousLiteral.rock"))
  test("incrementMysteriousVariable.rock", () => testWithFixture("increment/incrementMysteriousVariable.rock"))
  test("incrementNullLiteral.rock", () => testWithFixture("increment/incrementNullLiteral.rock"))
  test("incrementStringLiteral.rock", () => testWithFixture("increment/incrementStringLiteral.rock"))
  test("incrementStringVariable.rock", () => testWithFixture("increment/incrementStringVariable.rock"))
})

describe("simple", () => {
  test("hello.rock", () => testWithFixture("simple/hello.rock"))
  test("sayInput.rock", () => testWithFixture("simple/sayInput.rock"))
})
