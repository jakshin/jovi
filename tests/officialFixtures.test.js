const testWithFixture = require("./utils/testWithFixture")

describe("official: comments", () => {
  test("complex_comments.rock", () => testWithFixture("official/comments/complex_comments.rock"))
  test("simpleComments.rock", () => testWithFixture("official/comments/simpleComments.rock"))
  test("simple_comment.rock", () => testWithFixture("official/comments/simple_comment.rock"))
})

describe("official: conditionals", () => {
  test("empty_if.rock", () => testWithFixture("official/conditionals/empty_if.rock"))
  test("simpleConditionals.rock", () => testWithFixture("official/conditionals/simpleConditionals.rock"))
  test.skip("truthinessTest.rock", () => testWithFixture("official/conditionals/truthinessTest.rock"))
})

describe("official: constants", () => {
  test("constants.rock", () => testWithFixture("official/constants/constants.rock"))
})

describe("official: control-flow", () => {
  test("nested_loops.rock", () => testWithFixture("official/control-flow/nested_loops.rock"))
  test("simpleLoops.rock", () => testWithFixture("official/control-flow/simpleLoops.rock"))
})

describe("official: equality", () => {
  test("booleans.rock", () => testWithFixture("official/equality/booleans.rock"))
  test("equalityComparison.rock", () => testWithFixture("official/equality/equalityComparison.rock"))
  test("mysterious.rock", () => testWithFixture("official/equality/mysterious.rock"))
  test("negation.rock", () => testWithFixture("official/equality/negation.rock"))
  test("nothing.rock", () => testWithFixture("official/equality/nothing.rock"))
  test("null.rock", () => testWithFixture("official/equality/null.rock"))
  test("numbers.rock", () => testWithFixture("official/equality/numbers.rock"))
  test("strings.rock", () => testWithFixture("official/equality/strings.rock"))
})

describe("official: examples", () => {
  test("99_beers.rock", () => testWithFixture("official/examples/99_beers.rock"))
  test("factorial.rock", () => testWithFixture("official/examples/factorial.rock"))
  test("fibonacci.rock", () => testWithFixture("official/examples/fibonacci.rock"))
  test("fizzbuzz-idiomatic.rock", () => testWithFixture("official/examples/fizzbuzz-idiomatic.rock"))
  test("fizzbuzz-minimalist.rock", () => testWithFixture("official/examples/fizzbuzz-minimalist.rock"))
})

describe("official: functions", () => {
  test("functionCalls.rock", () => testWithFixture("official/functions/functionCalls.rock"))
  test.skip("nested_function_scopes.rock", () => testWithFixture("official/functions/nested_function_scopes.rock"))
  test.skip("nested_functions.rock", () => testWithFixture("official/functions/nested_functions.rock"))
  test("recursion.rock", () => testWithFixture("official/functions/recursion.rock"))
  test("simpleFunctions.rock", () => testWithFixture("official/functions/simpleFunctions.rock"))
})

describe("official: io", () => {
  test("hello_number.rock", () => testWithFixture("official/io/hello_number.rock"))
  test("hello_world.rock", () => testWithFixture("official/io/hello_world.rock"))
  test("inputTest.rock", () => testWithFixture("official/io/inputTest.rock"))
  test("inputTest2.rock", () => testWithFixture("official/io/inputTest2.rock"))
})

describe("official: literals", () => {
  test("literalAliases.rock", () => testWithFixture("official/literals/literalAliases.rock"))
  test("literalstrings.rock", () => testWithFixture("official/literals/literalstrings.rock"))
  test("poeticLiterals.rock", () => testWithFixture("official/literals/poeticLiterals.rock"))
  test("poeticNumbers.rock", () => testWithFixture("official/literals/poeticNumbers.rock"))
})

describe("official: math", () => {
  test("operator_aliases.rock", () => testWithFixture("official/math/operator_aliases.rock"))
  test("operator_precedence.rock", () => testWithFixture("official/math/operator_precedence.rock"))
  test("operators.rock", () => testWithFixture("official/math/operators.rock"))
})

describe("official: operators", () => {
  test("addOperator.rock", () => testWithFixture("official/operators/addOperator.rock"))
  test("andTest.rock", () => testWithFixture("official/operators/andTest.rock"))
  test("booleans.rock", () => testWithFixture("official/operators/booleans.rock"))
  test("divisionOperator.rock", () => testWithFixture("official/operators/divisionOperator.rock"))
  test("incrementAndDecrement.rock", () => testWithFixture("official/operators/incrementAndDecrement.rock"))
  test.skip("multiplicationOperator.rock", () => testWithFixture("official/operators/multiplicationOperator.rock"))
  test("notTest.rock", () => testWithFixture("official/operators/notTest.rock"))
  test("orNorTest.rock", () => testWithFixture("official/operators/orNorTest.rock"))
  test("orderingComparison.rock", () => testWithFixture("official/operators/orderingComparison.rock"))
  test("subtractOperator.rock", () => testWithFixture("official/operators/subtractOperator.rock"))
})

describe("official: variables", () => {
  test("common_variables.rock", () => testWithFixture("official/variables/common_variables.rock"))
  test("globalVariables.rock", () => testWithFixture("official/variables/globalVariables.rock"))
  test("poeticStrings.rock", () => testWithFixture("official/variables/poeticStrings.rock"))
  test("pronouns.rock", () => testWithFixture("official/variables/pronouns.rock"))
  test("proper_variables.rock", () => testWithFixture("official/variables/proper_variables.rock"))
  test("simple_pronouns.rock", () => testWithFixture("official/variables/simple_pronouns.rock"))
  test("umlauts.rock", () => testWithFixture("official/variables/umlauts.rock"))
})

describe("official: whitespace", () => {
  test("apostrophesIgnored.rock", () => testWithFixture("official/whitespace/apostrophesIgnored.rock"))
  test("leading_blank_lines.rock", () => testWithFixture("official/whitespace/leading_blank_lines.rock"))
  test("leading_empty_lines.rock", () => testWithFixture("official/whitespace/leading_empty_lines.rock"))
  test("leading_whitespace.rock", () => testWithFixture("official/whitespace/leading_whitespace.rock"))
  test("no_newline_at_eof.rock", () => testWithFixture("official/whitespace/no_newline_at_eof.rock"))
  test("trailing_blank_lines.rock", () => testWithFixture("official/whitespace/trailing_blank_lines.rock"))
  test("trailing_empty_lines.rock", () => testWithFixture("official/whitespace/trailing_empty_lines.rock"))
})
