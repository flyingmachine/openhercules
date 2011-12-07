Feature: View List
  Users want to view some lists

  Scenario: A registered user tries to view his own list
    Given I am a registered user
    And I have a public list
    When I try to view my list
    Then I should see it

  Scenario: A registered user tries to view his own non-readable list
    Given I am a registered user
    And I have a non-readable list
    When I try to view my list
    Then I should see it

  Scenario: A registered user tries to view a non-readable list
    Given I am a registered user
    When I try to view a non-readable list
    Then I should see a warning which reads "That list could not be found."
    And I should see my organizer

  Scenario: A registered user tries to view a public list
    Given I am a registered user
    When I try to view a public list
    Then I should see it

  Scenario: An anonymous user tries to view his own list
    Given I am an anonymous user
    And I have a public list
    When I try to view my list
    Then I should see it
    
  Scenario: An anonymous user tries to view a non-readable list
    Given I am an anonymous user
    When I try to view a non-readable list
    Then I should see a warning which reads "That list could not be found."
    And I should see my organizer

  Scenario: An anonymous user tries to view a non-existent list
    Given I am an anonymous user
    When I try to view a non-existent list
    Then I should see a warning which reads "That list could not be found."
    And I should see my organizer

  Scenario: An anonymous user tries to view a public list
    Given I am an anonymous user
    When I try to view a public list
    Then I should see it

  Scenario: A guest tries to view a non-readable list
    Given I am a guest
    When I try to view a non-readable list
    Then I should be redirected to the home page
    And I should see a warning which reads "That list could not be found."

  Scenario: A guest tries to view a non-existent list
    Given I am a guest
    When I try to view a non-existent list
    Then I should be redirected to the home page
    And I should see a warning which reads "That list could not be found."
