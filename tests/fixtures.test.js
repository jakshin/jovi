const testWithFixture = require("./fixtureUtils/testWithFixture")

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
