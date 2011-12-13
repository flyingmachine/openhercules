Feature: Clone list
  Users want to clone some lists

  Scenario Outline: Users should see the 'clone list' option
    Given I am a <User Type> user
    When I visit a publicly readable list
    Then I should see the words "Clone List"

    Examples:
      | User Type  |
      | registered |
      | anonymous  |
      | guest      |

  Scenario Outline: A user clones a list
    Given I am a <User Type> user
    When I visit a publicly readable list
    And I clone the list
    Then I should see the cloned list

    Examples:
      | User Type  |
      | registered |
      | anonymous  |


  Scenario: A guest clones a list
    Given I am a guest user
    When I visit a publicly readable list
    And I clone the list
    Then I should become an anonymous user
    And I should see the cloned list
