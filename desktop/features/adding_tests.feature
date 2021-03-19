@ui
Feature: We can add tests

  Scenario: Running tests
    When I run the tests
    Then the application title is "Hello World!"

  Scenario: Getting text
    When I run the tests
    Then the "#test-text" div says "This is only a test."

