const testWithFixture = require("./utils/testWithFixture")

describe("official: comments", () => {
  test("complex_comments.rock converted to JS", () => testWithFixture("official/comments/complex_comments.rock", "JS"))
  test("simpleComments.rock converted to JS", () => testWithFixture("official/comments/simpleComments.rock", "JS"))
  test("simple_comment.rock converted to JS", () => testWithFixture("official/comments/simple_comment.rock", "JS"))
})

describe("official: conditionals", () => {
  test("empty_if.rock converted to JS", () => testWithFixture("official/conditionals/empty_if.rock", "JS"))
  test("simpleConditionals.rock converted to JS", () => testWithFixture("official/conditionals/simpleConditionals.rock", "JS"))
  test("truthinessTest.rock converted to JS", () => testWithFixture("official/conditionals/truthinessTest.rock", "JS"))
})

describe("official: constants", () => {
  test("constants.rock converted to JS", () => testWithFixture("official/constants/constants.rock", "JS"))
})

describe("official: control-flow", () => {
  test("nested_loops.rock converted to JS", () => testWithFixture("official/control-flow/nested_loops.rock", "JS"))
  test("simpleLoops.rock converted to JS", () => testWithFixture("official/control-flow/simpleLoops.rock", "JS"))
})

describe("official: equality", () => {
  test("booleans.rock converted to JS", () => testWithFixture("official/equality/booleans.rock", "JS"))
  test("equalityComparison.rock converted to JS", () => testWithFixture("official/equality/equalityComparison.rock", "JS"))
  test("mysterious.rock converted to JS", () => testWithFixture("official/equality/mysterious.rock", "JS"))
  test("negation.rock converted to JS", () => testWithFixture("official/equality/negation.rock", "JS"))
  test("nothing.rock converted to JS", () => testWithFixture("official/equality/nothing.rock", "JS"))
  test("null.rock converted to JS", () => testWithFixture("official/equality/null.rock", "JS"))
  test("numbers.rock converted to JS", () => testWithFixture("official/equality/numbers.rock", "JS"))
  test("strings.rock converted to JS", () => testWithFixture("official/equality/strings.rock", "JS"))
})

describe("official: examples", () => {
  test("99_beers.rock converted to JS", () => testWithFixture("official/examples/99_beers.rock", "JS"))
  test("factorial.rock converted to JS", () => testWithFixture("official/examples/factorial.rock", "JS"))
  test("fibonacci.rock converted to JS", () => testWithFixture("official/examples/fibonacci.rock", "JS"))
  test("fizzbuzz-idiomatic.rock converted to JS", () => testWithFixture("official/examples/fizzbuzz-idiomatic.rock", "JS"))
  test("fizzbuzz-minimalist.rock converted to JS", () => testWithFixture("official/examples/fizzbuzz-minimalist.rock", "JS"))
})

describe("official: functions", () => {
  test("functionCalls.rock converted to JS", () => testWithFixture("official/functions/functionCalls.rock", "JS"))
  test("nested_function_scopes.rock converted to JS", () => testWithFixture("official/functions/nested_function_scopes.rock", "JS"))
  test("nested_functions.rock converted to JS", () => testWithFixture("official/functions/nested_functions.rock", "JS"))
  test("recursion.rock converted to JS", () => testWithFixture("official/functions/recursion.rock", "JS"))
  test("simpleFunctions.rock converted to JS", () => testWithFixture("official/functions/simpleFunctions.rock", "JS"))
})

describe("official: io", () => {
  test("hello_number.rock converted to JS", () => testWithFixture("official/io/hello_number.rock", "JS"))
  test("hello_world.rock converted to JS", () => testWithFixture("official/io/hello_world.rock", "JS"))
  test("inputTest.rock converted to JS", () => testWithFixture("official/io/inputTest.rock", "JS"))
  test("inputTest2.rock converted to JS", () => testWithFixture("official/io/inputTest2.rock", "JS"))
})

describe("official: literals", () => {
  test("literalAliases.rock converted to JS", () => testWithFixture("official/literals/literalAliases.rock", "JS"))
  test("literalstrings.rock converted to JS", () => testWithFixture("official/literals/literalstrings.rock", "JS"))
  test("poeticLiterals.rock converted to JS", () => testWithFixture("official/literals/poeticLiterals.rock", "JS"))
  test("poeticNumbers.rock converted to JS", () => testWithFixture("official/literals/poeticNumbers.rock", "JS"))
})

describe("official: math", () => {
  test("operator_aliases.rock converted to JS", () => testWithFixture("official/math/operator_aliases.rock", "JS"))
  test("operator_precedence.rock converted to JS", () => testWithFixture("official/math/operator_precedence.rock", "JS"))
  test("operators.rock converted to JS", () => testWithFixture("official/math/operators.rock", "JS"))
})

describe("official: operators", () => {
  test("addOperator.rock converted to JS", () => testWithFixture("official/operators/addOperator.rock", "JS"))
  test("andTest.rock converted to JS", () => testWithFixture("official/operators/andTest.rock", "JS"))
  test("booleans.rock converted to JS", () => testWithFixture("official/operators/booleans.rock", "JS"))
  test("divisionOperator.rock converted to JS", () => testWithFixture("official/operators/divisionOperator.rock", "JS"))
  test("incrementAndDecrement.rock converted to JS", () => testWithFixture("official/operators/incrementAndDecrement.rock", "JS"))
  test("multiplicationOperator.rock converted to JS", () => testWithFixture("official/operators/multiplicationOperator.rock", "JS"))
  test("notTest.rock converted to JS", () => testWithFixture("official/operators/notTest.rock", "JS"))
  test("orNorTest.rock converted to JS", () => testWithFixture("official/operators/orNorTest.rock", "JS"))
  test("orderingComparison.rock converted to JS", () => testWithFixture("official/operators/orderingComparison.rock", "JS"))
  test("subtractOperator.rock converted to JS", () => testWithFixture("official/operators/subtractOperator.rock", "JS"))
})

describe("official: variables", () => {
  test("common_variables.rock converted to JS", () => testWithFixture("official/variables/common_variables.rock", "JS"))
  test("globalVariables.rock converted to JS", () => testWithFixture("official/variables/globalVariables.rock", "JS"))
  test("poeticStrings.rock converted to JS", () => testWithFixture("official/variables/poeticStrings.rock", "JS"))
  test("pronouns.rock converted to JS", () => testWithFixture("official/variables/pronouns.rock", "JS"))
  test("proper_variables.rock converted to JS", () => testWithFixture("official/variables/proper_variables.rock", "JS"))
  test("simple_pronouns.rock converted to JS", () => testWithFixture("official/variables/simple_pronouns.rock", "JS"))
  test("umlauts.rock converted to JS", () => testWithFixture("official/variables/umlauts.rock", "JS"))
})

describe("official: whitespace", () => {
  test("apostrophesIgnored.rock converted to JS", () => testWithFixture("official/whitespace/apostrophesIgnored.rock", "JS"))
  test("leading_blank_lines.rock converted to JS", () => testWithFixture("official/whitespace/leading_blank_lines.rock", "JS"))
  test("leading_empty_lines.rock converted to JS", () => testWithFixture("official/whitespace/leading_empty_lines.rock", "JS"))
  test("leading_whitespace.rock converted to JS", () => testWithFixture("official/whitespace/leading_whitespace.rock", "JS"))
  test("no_newline_at_eof.rock converted to JS", () => testWithFixture("official/whitespace/no_newline_at_eof.rock", "JS"))
  test("trailing_blank_lines.rock converted to JS", () => testWithFixture("official/whitespace/trailing_blank_lines.rock", "JS"))
  test("trailing_empty_lines.rock converted to JS", () => testWithFixture("official/whitespace/trailing_empty_lines.rock", "JS"))
})
