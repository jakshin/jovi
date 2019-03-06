const testWithFixture = require("./utils/testWithFixture")

describe("aliases", () => {
  test("addition.rock", () => testWithFixture("aliases/addition.rock"))
  test("booleans.rock", () => testWithFixture("aliases/booleans.rock"))
  test("comparison.rock", () => testWithFixture("aliases/comparison.rock"))
  test("multiplication.rock", () => testWithFixture("aliases/multiplication.rock"))
  test("null.rock", () => testWithFixture("aliases/null.rock"))
  test("output.rock", () => testWithFixture("aliases/output.rock"))
  test("subtraction.rock", () => testWithFixture("aliases/subtraction.rock"))
})

describe("assignment", () => {
  test("expressions.rock", () => testWithFixture("assignment/expressions.rock"))
  test("pronouns.rock", () => testWithFixture("assignment/pronouns.rock"))
  test("simple.rock", () => testWithFixture("assignment/simple.rock"))
})

describe("comparison: equality", () => {
  test("booleans.rock", () => testWithFixture("comparison/equality/booleans.rock"))
  test("mysterious.rock", () => testWithFixture("comparison/equality/mysterious.rock"))
  test("null.rock", () => testWithFixture("comparison/equality/null.rock"))
  test("numbers.rock", () => testWithFixture("comparison/equality/numbers.rock"))
  test("strings.rock", () => testWithFixture("comparison/equality/strings.rock"))
})

describe("comparison: greater", () => {
  test("booleans.rock", () => testWithFixture("comparison/greater/booleans.rock"))
  test("mysterious.rock", () => testWithFixture("comparison/greater/mysterious.rock"))
  test("null.rock", () => testWithFixture("comparison/greater/null.rock"))
  test("numbers.rock", () => testWithFixture("comparison/greater/numbers.rock"))
  test("strings.rock", () => testWithFixture("comparison/greater/strings.rock"))
})

describe("comparison: greaterOrEqual", () => {
  test("booleans.rock", () => testWithFixture("comparison/greaterOrEqual/booleans.rock"))
  test("mysterious.rock", () => testWithFixture("comparison/greaterOrEqual/mysterious.rock"))
  test("null.rock", () => testWithFixture("comparison/greaterOrEqual/null.rock"))
  test("numbers.rock", () => testWithFixture("comparison/greaterOrEqual/numbers.rock"))
  test("strings.rock", () => testWithFixture("comparison/greaterOrEqual/strings.rock"))
})

describe("comparison: inequality", () => {
  test("booleans.rock", () => testWithFixture("comparison/inequality/booleans.rock"))
  test("mysterious.rock", () => testWithFixture("comparison/inequality/mysterious.rock"))
  test("null.rock", () => testWithFixture("comparison/inequality/null.rock"))
  test("numbers.rock", () => testWithFixture("comparison/inequality/numbers.rock"))
  test("strings.rock", () => testWithFixture("comparison/inequality/strings.rock"))
})

describe("comparison: less", () => {
  test("booleans.rock", () => testWithFixture("comparison/less/booleans.rock"))
  test("mysterious.rock", () => testWithFixture("comparison/less/mysterious.rock"))
  test("null.rock", () => testWithFixture("comparison/less/null.rock"))
  test("numbers.rock", () => testWithFixture("comparison/less/numbers.rock"))
  test("strings.rock", () => testWithFixture("comparison/less/strings.rock"))
})

describe("comparison: lessOrEqual", () => {
  test("booleans.rock", () => testWithFixture("comparison/lessOrEqual/booleans.rock"))
  test("mysterious.rock", () => testWithFixture("comparison/lessOrEqual/mysterious.rock"))
  test("null.rock", () => testWithFixture("comparison/lessOrEqual/null.rock"))
  test("numbers.rock", () => testWithFixture("comparison/lessOrEqual/numbers.rock"))
  test("strings.rock", () => testWithFixture("comparison/lessOrEqual/strings.rock"))
})

describe("conditionals", () => {
  test("basic.rock", () => testWithFixture("conditionals/basic.rock"))
  test("lastConditionalResult.rock", () => testWithFixture("conditionals/lastConditionalResult.rock"))
  test("nested.rock", () => testWithFixture("conditionals/nested.rock"))
  test("spacing.rock", () => testWithFixture("conditionals/spacing.rock"))
})

describe("io", () => {
  test("basicInput.rock", () => testWithFixture("io/basicInput.rock"))
  test("ignoreInput.rock", () => testWithFixture("io/ignoreInput.rock"))
  test("numericInput.rock", () => testWithFixture("io/numericInput.rock"))
  test("numericInputTooBig.rock", () => testWithFixture("io/numericInputTooBig.rock"))
  test("outputExpression.rock", () => testWithFixture("io/outputExpression.rock"))
  test("outputLiteral.rock", () => testWithFixture("io/outputLiteral.rock"))
  test("outputVariable.rock", () => testWithFixture("io/outputVariable.rock"))
})

describe("loops", () => {
  test("break.rock", () => testWithFixture("loops/break.rock"))
  test("continue.rock", () => testWithFixture("loops/continue.rock"))
  test("nested.rock", () => testWithFixture("loops/nested.rock"))
  test("until.rock", () => testWithFixture("loops/until.rock"))
  test("while.rock", () => testWithFixture("loops/while.rock"))
})

describe("math: addition", () => {
  test("add.rock", () => testWithFixture("math/addition/add.rock"))
  test("addBooleanLiteral.rock", () => testWithFixture("math/addition/addBooleanLiteral.rock"))
  test("addBooleanVariable.rock", () => testWithFixture("math/addition/addBooleanVariable.rock"))
  test("addMysteriousLiteral.rock", () => testWithFixture("math/addition/addMysteriousLiteral.rock"))
  test("addMysteriousVariable.rock", () => testWithFixture("math/addition/addMysteriousVariable.rock"))
  test("addToBooleanLiteral.rock", () => testWithFixture("math/addition/addToBooleanLiteral.rock"))
  test("addToBooleanVariable.rock", () => testWithFixture("math/addition/addToBooleanVariable.rock"))
  test("addToMysteriousLiteral.rock", () => testWithFixture("math/addition/addToMysteriousLiteral.rock"))
  test("addToMysteriousVariable.rock", () => testWithFixture("math/addition/addToMysteriousVariable.rock"))
})

describe("math: decrement", () => {
  test("decrement.rock", () => testWithFixture("math/decrement/decrement.rock"))
  test("decrementBooleanLiteral.rock", () => testWithFixture("math/decrement/decrementBooleanLiteral.rock"))
  test("decrementFloatLiteral.rock", () => testWithFixture("math/decrement/decrementFloatLiteral.rock"))
  test("decrementIntegerLiteral.rock", () => testWithFixture("math/decrement/decrementIntegerLiteral.rock"))
  test("decrementMysteriousLiteral.rock", () => testWithFixture("math/decrement/decrementMysteriousLiteral.rock"))
  test("decrementMysteriousVariable.rock", () => testWithFixture("math/decrement/decrementMysteriousVariable.rock"))
  test("decrementNullLiteral.rock", () => testWithFixture("math/decrement/decrementNullLiteral.rock"))
  test("decrementStringLiteral.rock", () => testWithFixture("math/decrement/decrementStringLiteral.rock"))
  test("decrementStringVariable.rock", () => testWithFixture("math/decrement/decrementStringVariable.rock"))
})

describe("math: division", () => {
  test("divide.rock", () => testWithFixture("math/division/divide.rock"))
  test("divideBooleanLiteral.rock", () => testWithFixture("math/division/divideBooleanLiteral.rock"))
  test("divideBooleanVariable.rock", () => testWithFixture("math/division/divideBooleanVariable.rock"))
  test("divideByBooleanLiteral.rock", () => testWithFixture("math/division/divideByBooleanLiteral.rock"))
  test("divideByBooleanVariable.rock", () => testWithFixture("math/division/divideByBooleanVariable.rock"))
  test("divideByMysteriousLiteral.rock", () => testWithFixture("math/division/divideByMysteriousLiteral.rock"))
  test("divideByMysteriousVariable.rock", () => testWithFixture("math/division/divideByMysteriousVariable.rock"))
  test("divideByStringLiteral.rock", () => testWithFixture("math/division/divideByStringLiteral.rock"))
  test("divideByStringVariable.rock", () => testWithFixture("math/division/divideByStringVariable.rock"))
  test("divideByZero.rock", () => testWithFixture("math/division/divideByZero.rock"))
  test("divideMysteriousLiteral.rock", () => testWithFixture("math/division/divideMysteriousLiteral.rock"))
  test("divideMysteriousVariable.rock", () => testWithFixture("math/division/divideMysteriousVariable.rock"))
  test("divideStringLiteral.rock", () => testWithFixture("math/division/divideStringLiteral.rock"))
  test("divideStringVariable.rock", () => testWithFixture("math/division/divideStringVariable.rock"))
})

describe("math: increment", () => {
  test("increment.rock", () => testWithFixture("math/increment/increment.rock"))
  test("incrementBooleanLiteral.rock", () => testWithFixture("math/increment/incrementBooleanLiteral.rock"))
  test("incrementFloatLiteral.rock", () => testWithFixture("math/increment/incrementFloatLiteral.rock"))
  test("incrementIntegerLiteral.rock", () => testWithFixture("math/increment/incrementIntegerLiteral.rock"))
  test("incrementMysteriousLiteral.rock", () => testWithFixture("math/increment/incrementMysteriousLiteral.rock"))
  test("incrementMysteriousVariable.rock", () => testWithFixture("math/increment/incrementMysteriousVariable.rock"))
  test("incrementNullLiteral.rock", () => testWithFixture("math/increment/incrementNullLiteral.rock"))
  test("incrementStringLiteral.rock", () => testWithFixture("math/increment/incrementStringLiteral.rock"))
  test("incrementStringVariable.rock", () => testWithFixture("math/increment/incrementStringVariable.rock"))
})

describe("math: multiplication", () => {
  test("multiply.rock", () => testWithFixture("math/multiplication/multiply.rock"))
  test("multiplyBooleanLiteral.rock", () => testWithFixture("math/multiplication/multiplyBooleanLiteral.rock"))
  test("multiplyBooleanVariable.rock", () => testWithFixture("math/multiplication/multiplyBooleanVariable.rock"))
  test("multiplyByBooleanLiteral.rock", () => testWithFixture("math/multiplication/multiplyByBooleanLiteral.rock"))
  test("multiplyByBooleanVariable.rock", () => testWithFixture("math/multiplication/multiplyByBooleanVariable.rock"))
  test("multiplyByMysteriousLiteral.rock", () => testWithFixture("math/multiplication/multiplyByMysteriousLiteral.rock"))
  test("multiplyByMysteriousVariable.rock", () => testWithFixture("math/multiplication/multiplyByMysteriousVariable.rock"))
  test("multiplyMysteriousLiteral.rock", () => testWithFixture("math/multiplication/multiplyMysteriousLiteral.rock"))
  test("multiplyMysteriousVariable.rock", () => testWithFixture("math/multiplication/multiplyMysteriousVariable.rock"))
  test("multiplyStringByNegative.rock", () => testWithFixture("math/multiplication/multiplyStringByNegative.rock"))
})

describe("math: subtraction", () => {
  test("subtract.rock", () => testWithFixture("math/subtraction/subtract.rock"))
  test("subtractBooleanLiteral.rock", () => testWithFixture("math/subtraction/subtractBooleanLiteral.rock"))
  test("subtractBooleanVariable.rock", () => testWithFixture("math/subtraction/subtractBooleanVariable.rock"))
  test("subtractFromBooleanLiteral.rock", () => testWithFixture("math/subtraction/subtractFromBooleanLiteral.rock"))
  test("subtractFromBooleanVariable.rock", () => testWithFixture("math/subtraction/subtractFromBooleanVariable.rock"))
  test("subtractFromMysteriousLiteral.rock", () => testWithFixture("math/subtraction/subtractFromMysteriousLiteral.rock"))
  test("subtractFromMysteriousVariable.rock", () => testWithFixture("math/subtraction/subtractFromMysteriousVariable.rock"))
  test("subtractFromStringLiteral.rock", () => testWithFixture("math/subtraction/subtractFromStringLiteral.rock"))
  test("subtractFromStringVariable.rock", () => testWithFixture("math/subtraction/subtractFromStringVariable.rock"))
  test("subtractMysteriousLiteral.rock", () => testWithFixture("math/subtraction/subtractMysteriousLiteral.rock"))
  test("subtractMysteriousVariable.rock", () => testWithFixture("math/subtraction/subtractMysteriousVariable.rock"))
  test("subtractStringLiteral.rock", () => testWithFixture("math/subtraction/subtractStringLiteral.rock"))
  test("subtractStringVariable.rock", () => testWithFixture("math/subtraction/subtractStringVariable.rock"))
})

describe("simple", () => {
  test("empty.rock", () => testWithFixture("simple/empty.rock"))
  test("hello.rock", () => testWithFixture("simple/hello.rock"))
})

describe("variables", () => {
  test("pronouns.rock", () => testWithFixture("variables/pronouns.rock"))
})
