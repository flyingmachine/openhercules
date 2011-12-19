@javascript
Feature: Add Sharees
  
  Scenario: An anonymous user adds a sharee
    Given I am an anonymous user
    And I have a publicly readable list
    When I visit my list
    And I add a user to my sharees
    And I refresh the page
    Then I should not see the user I added to my sharees

  Scenario: A registered user adds a sharee
    Given I am a registered user
    And I have a publicly readable list
    When I visit my list
    And I add a user to my sharees
    And I refresh the page
    Then I should see the user I added to my sharees
