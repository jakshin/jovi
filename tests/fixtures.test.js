const testWithFixture = require("./fixtureUtils/testWithFixture")

describe("simple", () => {
  test("hello.rock", () => testWithFixture("simple/hello.rock"))
  test("sayInput.rock", () => testWithFixture("simple/sayInput.rock"))
})
