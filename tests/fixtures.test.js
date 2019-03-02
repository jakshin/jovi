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

describe("division", () => {
  test("divide.rock", () => testWithFixture("division/divide.rock"))
  test("divideBooleanLiteral.rock", () => testWithFixture("division/divideBooleanLiteral.rock"))
  test("divideBooleanVariable.rock", () => testWithFixture("division/divideBooleanVariable.rock"))
  test("divideByBooleanLiteral.rock", () => testWithFixture("division/divideByBooleanLiteral.rock"))
  test("divideByBooleanVariable.rock", () => testWithFixture("division/divideByBooleanVariable.rock"))
  test("divideByMysteriousLiteral.rock", () => testWithFixture("division/divideByMysteriousLiteral.rock"))
  test("divideByMysteriousVariable.rock", () => testWithFixture("division/divideByMysteriousVariable.rock"))
  test("divideByStringLiteral.rock", () => testWithFixture("division/divideByStringLiteral.rock"))
  test("divideByStringVariable.rock", () => testWithFixture("division/divideByStringVariable.rock"))
  test("divideByZero.rock", () => testWithFixture("division/divideByZero.rock"))
  test("divideMysteriousLiteral.rock", () => testWithFixture("division/divideMysteriousLiteral.rock"))
  test("divideMysteriousVariable.rock", () => testWithFixture("division/divideMysteriousVariable.rock"))
  test("divideStringLiteral.rock", () => testWithFixture("division/divideStringLiteral.rock"))
  test("divideStringVariable.rock", () => testWithFixture("division/divideStringVariable.rock"))
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

describe("subtraction", () => {
  test("subtract.rock", () => testWithFixture("subtraction/subtract.rock"))
  test("subtractBooleanLiteral.rock", () => testWithFixture("subtraction/subtractBooleanLiteral.rock"))
  test("subtractBooleanVariable.rock", () => testWithFixture("subtraction/subtractBooleanVariable.rock"))
  test("subtractFromBooleanLiteral.rock", () => testWithFixture("subtraction/subtractFromBooleanLiteral.rock"))
  test("subtractFromBooleanVariable.rock", () => testWithFixture("subtraction/subtractFromBooleanVariable.rock"))
  test("subtractFromMysteriousLiteral.rock", () => testWithFixture("subtraction/subtractFromMysteriousLiteral.rock"))
  test("subtractFromMysteriousVariable.rock", () => testWithFixture("subtraction/subtractFromMysteriousVariable.rock"))
  test("subtractFromStringLiteral.rock", () => testWithFixture("subtraction/subtractFromStringLiteral.rock"))
  test("subtractFromStringVariable.rock", () => testWithFixture("subtraction/subtractFromStringVariable.rock"))
  test("subtractMysteriousLiteral.rock", () => testWithFixture("subtraction/subtractMysteriousLiteral.rock"))
  test("subtractMysteriousVariable.rock", () => testWithFixture("subtraction/subtractMysteriousVariable.rock"))
  test("subtractStringLiteral.rock", () => testWithFixture("subtraction/subtractStringLiteral.rock"))
  test("subtractStringVariable.rock", () => testWithFixture("subtraction/subtractStringVariable.rock"))
})
