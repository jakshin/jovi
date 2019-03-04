const testWithFixture = require("./fixtureUtils/testWithFixture")

describe("aliases", () => {
  test("addition.rock converted to JS", () => testWithFixture("aliases/addition.rock", "JS"))
  test("booleans.rock converted to JS", () => testWithFixture("aliases/booleans.rock", "JS"))
  test("comparison.rock converted to JS", () => testWithFixture("aliases/comparison.rock", "JS"))
  test("multiplication.rock converted to JS", () => testWithFixture("aliases/multiplication.rock", "JS"))
  test("null.rock converted to JS", () => testWithFixture("aliases/null.rock", "JS"))
  test("output.rock converted to JS", () => testWithFixture("aliases/output.rock", "JS"))
  test("subtraction.rock converted to JS", () => testWithFixture("aliases/subtraction.rock", "JS"))
})

describe("comparison: equality", () => {
  test("booleans.rock converted to JS", () => testWithFixture("comparison/equality/booleans.rock", "JS"))
  test("mysterious.rock converted to JS", () => testWithFixture("comparison/equality/mysterious.rock", "JS"))
  test("null.rock converted to JS", () => testWithFixture("comparison/equality/null.rock", "JS"))
  test("numbers.rock converted to JS", () => testWithFixture("comparison/equality/numbers.rock", "JS"))
  test("strings.rock converted to JS", () => testWithFixture("comparison/equality/strings.rock", "JS"))
})

describe("comparison: greater", () => {
  test("booleans.rock converted to JS", () => testWithFixture("comparison/greater/booleans.rock", "JS"))
  test("mysterious.rock converted to JS", () => testWithFixture("comparison/greater/mysterious.rock", "JS"))
  test("null.rock converted to JS", () => testWithFixture("comparison/greater/null.rock", "JS"))
  test("numbers.rock converted to JS", () => testWithFixture("comparison/greater/numbers.rock", "JS"))
  test("strings.rock converted to JS", () => testWithFixture("comparison/greater/strings.rock", "JS"))
})

describe("comparison: greaterOrEqual", () => {
  test("booleans.rock converted to JS", () => testWithFixture("comparison/greaterOrEqual/booleans.rock", "JS"))
  test("mysterious.rock converted to JS", () => testWithFixture("comparison/greaterOrEqual/mysterious.rock", "JS"))
  test("null.rock converted to JS", () => testWithFixture("comparison/greaterOrEqual/null.rock", "JS"))
  test("numbers.rock converted to JS", () => testWithFixture("comparison/greaterOrEqual/numbers.rock", "JS"))
  test("strings.rock converted to JS", () => testWithFixture("comparison/greaterOrEqual/strings.rock", "JS"))
})

describe("comparison: inequality", () => {
  test("booleans.rock converted to JS", () => testWithFixture("comparison/inequality/booleans.rock", "JS"))
  test("mysterious.rock converted to JS", () => testWithFixture("comparison/inequality/mysterious.rock", "JS"))
  test("null.rock converted to JS", () => testWithFixture("comparison/inequality/null.rock", "JS"))
  test("numbers.rock converted to JS", () => testWithFixture("comparison/inequality/numbers.rock", "JS"))
  test("strings.rock converted to JS", () => testWithFixture("comparison/inequality/strings.rock", "JS"))
})

describe("comparison: less", () => {
  test("booleans.rock converted to JS", () => testWithFixture("comparison/less/booleans.rock", "JS"))
  test("mysterious.rock converted to JS", () => testWithFixture("comparison/less/mysterious.rock", "JS"))
  test("null.rock converted to JS", () => testWithFixture("comparison/less/null.rock", "JS"))
  test("numbers.rock converted to JS", () => testWithFixture("comparison/less/numbers.rock", "JS"))
  test("strings.rock converted to JS", () => testWithFixture("comparison/less/strings.rock", "JS"))
})

describe("comparison: lessOrEqual", () => {
  test("booleans.rock converted to JS", () => testWithFixture("comparison/lessOrEqual/booleans.rock", "JS"))
  test("mysterious.rock converted to JS", () => testWithFixture("comparison/lessOrEqual/mysterious.rock", "JS"))
  test("null.rock converted to JS", () => testWithFixture("comparison/lessOrEqual/null.rock", "JS"))
  test("numbers.rock converted to JS", () => testWithFixture("comparison/lessOrEqual/numbers.rock", "JS"))
  test("strings.rock converted to JS", () => testWithFixture("comparison/lessOrEqual/strings.rock", "JS"))
})

describe("conditionals", () => {
  test("basic.rock converted to JS", () => testWithFixture("conditionals/basic.rock", "JS"))
  test("lastConditionalResult.rock converted to JS", () => testWithFixture("conditionals/lastConditionalResult.rock", "JS"))
  test("nested.rock converted to JS", () => testWithFixture("conditionals/nested.rock", "JS"))
  test("spacing.rock converted to JS", () => testWithFixture("conditionals/spacing.rock", "JS"))
})

describe("io", () => {
  test("basicInput.rock converted to JS", () => testWithFixture("io/basicInput.rock", "JS"))
  test.skip("ignoreInput.rock converted to JS", () => testWithFixture("io/ignoreInput.rock", "JS"))
  test("numericInput.rock converted to JS", () => testWithFixture("io/numericInput.rock", "JS"))
  test("numericInputTooBig.rock converted to JS", () => testWithFixture("io/numericInputTooBig.rock", "JS"))
  test("outputExpression.rock converted to JS", () => testWithFixture("io/outputExpression.rock", "JS"))
  test("outputLiteral.rock converted to JS", () => testWithFixture("io/outputLiteral.rock", "JS"))
  test("outputVariable.rock converted to JS", () => testWithFixture("io/outputVariable.rock", "JS"))
})

describe("math: addition", () => {
  test("add.rock converted to JS", () => testWithFixture("math/addition/add.rock", "JS"))
  test("addBooleanLiteral.rock converted to JS", () => testWithFixture("math/addition/addBooleanLiteral.rock", "JS"))
  test("addBooleanVariable.rock converted to JS", () => testWithFixture("math/addition/addBooleanVariable.rock", "JS"))
  test("addMysteriousLiteral.rock converted to JS", () => testWithFixture("math/addition/addMysteriousLiteral.rock", "JS"))
  test("addMysteriousVariable.rock converted to JS", () => testWithFixture("math/addition/addMysteriousVariable.rock", "JS"))
  test("addToBooleanLiteral.rock converted to JS", () => testWithFixture("math/addition/addToBooleanLiteral.rock", "JS"))
  test("addToBooleanVariable.rock converted to JS", () => testWithFixture("math/addition/addToBooleanVariable.rock", "JS"))
  test("addToMysteriousLiteral.rock converted to JS", () => testWithFixture("math/addition/addToMysteriousLiteral.rock", "JS"))
  test("addToMysteriousVariable.rock converted to JS", () => testWithFixture("math/addition/addToMysteriousVariable.rock", "JS"))
})

describe("math: decrement", () => {
  test("decrement.rock converted to JS", () => testWithFixture("math/decrement/decrement.rock", "JS"))
  test("decrementBooleanLiteral.rock converted to JS", () => testWithFixture("math/decrement/decrementBooleanLiteral.rock", "JS"))
  test("decrementFloatLiteral.rock converted to JS", () => testWithFixture("math/decrement/decrementFloatLiteral.rock", "JS"))
  test("decrementIntegerLiteral.rock converted to JS", () => testWithFixture("math/decrement/decrementIntegerLiteral.rock", "JS"))
  test("decrementMysteriousLiteral.rock converted to JS", () => testWithFixture("math/decrement/decrementMysteriousLiteral.rock", "JS"))
  test("decrementMysteriousVariable.rock converted to JS", () => testWithFixture("math/decrement/decrementMysteriousVariable.rock", "JS"))
  test("decrementNullLiteral.rock converted to JS", () => testWithFixture("math/decrement/decrementNullLiteral.rock", "JS"))
  test("decrementStringLiteral.rock converted to JS", () => testWithFixture("math/decrement/decrementStringLiteral.rock", "JS"))
  test("decrementStringVariable.rock converted to JS", () => testWithFixture("math/decrement/decrementStringVariable.rock", "JS"))
})

describe("math: division", () => {
  test("divide.rock converted to JS", () => testWithFixture("math/division/divide.rock", "JS"))
  test("divideBooleanLiteral.rock converted to JS", () => testWithFixture("math/division/divideBooleanLiteral.rock", "JS"))
  test("divideBooleanVariable.rock converted to JS", () => testWithFixture("math/division/divideBooleanVariable.rock", "JS"))
  test("divideByBooleanLiteral.rock converted to JS", () => testWithFixture("math/division/divideByBooleanLiteral.rock", "JS"))
  test("divideByBooleanVariable.rock converted to JS", () => testWithFixture("math/division/divideByBooleanVariable.rock", "JS"))
  test("divideByMysteriousLiteral.rock converted to JS", () => testWithFixture("math/division/divideByMysteriousLiteral.rock", "JS"))
  test("divideByMysteriousVariable.rock converted to JS", () => testWithFixture("math/division/divideByMysteriousVariable.rock", "JS"))
  test("divideByStringLiteral.rock converted to JS", () => testWithFixture("math/division/divideByStringLiteral.rock", "JS"))
  test("divideByStringVariable.rock converted to JS", () => testWithFixture("math/division/divideByStringVariable.rock", "JS"))
  test("divideByZero.rock converted to JS", () => testWithFixture("math/division/divideByZero.rock", "JS"))
  test("divideMysteriousLiteral.rock converted to JS", () => testWithFixture("math/division/divideMysteriousLiteral.rock", "JS"))
  test("divideMysteriousVariable.rock converted to JS", () => testWithFixture("math/division/divideMysteriousVariable.rock", "JS"))
  test("divideStringLiteral.rock converted to JS", () => testWithFixture("math/division/divideStringLiteral.rock", "JS"))
  test("divideStringVariable.rock converted to JS", () => testWithFixture("math/division/divideStringVariable.rock", "JS"))
})

describe("math: increment", () => {
  test("increment.rock converted to JS", () => testWithFixture("math/increment/increment.rock", "JS"))
  test("incrementBooleanLiteral.rock converted to JS", () => testWithFixture("math/increment/incrementBooleanLiteral.rock", "JS"))
  test("incrementFloatLiteral.rock converted to JS", () => testWithFixture("math/increment/incrementFloatLiteral.rock", "JS"))
  test("incrementIntegerLiteral.rock converted to JS", () => testWithFixture("math/increment/incrementIntegerLiteral.rock", "JS"))
  test("incrementMysteriousLiteral.rock converted to JS", () => testWithFixture("math/increment/incrementMysteriousLiteral.rock", "JS"))
  test("incrementMysteriousVariable.rock converted to JS", () => testWithFixture("math/increment/incrementMysteriousVariable.rock", "JS"))
  test("incrementNullLiteral.rock converted to JS", () => testWithFixture("math/increment/incrementNullLiteral.rock", "JS"))
  test("incrementStringLiteral.rock converted to JS", () => testWithFixture("math/increment/incrementStringLiteral.rock", "JS"))
  test("incrementStringVariable.rock converted to JS", () => testWithFixture("math/increment/incrementStringVariable.rock", "JS"))
})

describe("math: multiplication", () => {
  test("multiply.rock converted to JS", () => testWithFixture("math/multiplication/multiply.rock", "JS"))
  test("multiplyBooleanLiteral.rock converted to JS", () => testWithFixture("math/multiplication/multiplyBooleanLiteral.rock", "JS"))
  test("multiplyBooleanVariable.rock converted to JS", () => testWithFixture("math/multiplication/multiplyBooleanVariable.rock", "JS"))
  test("multiplyByBooleanLiteral.rock converted to JS", () => testWithFixture("math/multiplication/multiplyByBooleanLiteral.rock", "JS"))
  test("multiplyByBooleanVariable.rock converted to JS", () => testWithFixture("math/multiplication/multiplyByBooleanVariable.rock", "JS"))
  test("multiplyByMysteriousLiteral.rock converted to JS", () => testWithFixture("math/multiplication/multiplyByMysteriousLiteral.rock", "JS"))
  test("multiplyByMysteriousVariable.rock converted to JS", () => testWithFixture("math/multiplication/multiplyByMysteriousVariable.rock", "JS"))
  test("multiplyMysteriousLiteral.rock converted to JS", () => testWithFixture("math/multiplication/multiplyMysteriousLiteral.rock", "JS"))
  test("multiplyMysteriousVariable.rock converted to JS", () => testWithFixture("math/multiplication/multiplyMysteriousVariable.rock", "JS"))
  test("multiplyStringByNegative.rock converted to JS", () => testWithFixture("math/multiplication/multiplyStringByNegative.rock", "JS"))
})

describe("math: subtraction", () => {
  test("subtract.rock converted to JS", () => testWithFixture("math/subtraction/subtract.rock", "JS"))
  test("subtractBooleanLiteral.rock converted to JS", () => testWithFixture("math/subtraction/subtractBooleanLiteral.rock", "JS"))
  test("subtractBooleanVariable.rock converted to JS", () => testWithFixture("math/subtraction/subtractBooleanVariable.rock", "JS"))
  test("subtractFromBooleanLiteral.rock converted to JS", () => testWithFixture("math/subtraction/subtractFromBooleanLiteral.rock", "JS"))
  test("subtractFromBooleanVariable.rock converted to JS", () => testWithFixture("math/subtraction/subtractFromBooleanVariable.rock", "JS"))
  test("subtractFromMysteriousLiteral.rock converted to JS", () => testWithFixture("math/subtraction/subtractFromMysteriousLiteral.rock", "JS"))
  test("subtractFromMysteriousVariable.rock converted to JS", () => testWithFixture("math/subtraction/subtractFromMysteriousVariable.rock", "JS"))
  test("subtractFromStringLiteral.rock converted to JS", () => testWithFixture("math/subtraction/subtractFromStringLiteral.rock", "JS"))
  test("subtractFromStringVariable.rock converted to JS", () => testWithFixture("math/subtraction/subtractFromStringVariable.rock", "JS"))
  test("subtractMysteriousLiteral.rock converted to JS", () => testWithFixture("math/subtraction/subtractMysteriousLiteral.rock", "JS"))
  test("subtractMysteriousVariable.rock converted to JS", () => testWithFixture("math/subtraction/subtractMysteriousVariable.rock", "JS"))
  test("subtractStringLiteral.rock converted to JS", () => testWithFixture("math/subtraction/subtractStringLiteral.rock", "JS"))
  test("subtractStringVariable.rock converted to JS", () => testWithFixture("math/subtraction/subtractStringVariable.rock", "JS"))
})

describe("simple", () => {
  test("hello.rock converted to JS", () => testWithFixture("simple/hello.rock", "JS"))
})
