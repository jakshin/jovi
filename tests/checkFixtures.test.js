const runTestWithFixture = require("./fixtureUtils/runTestWithFixture")

describe("simple", () => {
  test("hello.rock", () => runTestWithFixture("simple/hello.rock"))
  test("sayInput.rock", () => runTestWithFixture("simple/sayInput.rock"))
})
