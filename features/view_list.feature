Feature: View List
  Users want to view some lists

  Scenario Outline: A user tries to view his own publicly readable list 
    Given I am a <User Type> user
    And I have a publicly readable list
    When I visit my list
    Then I should see my list

    Examples:
      | User Type  |
      | registered |
      | anonymous  |

  Scenario Outline: A user tries to view his own non-readable list
    Given I am a <User Type> user
    And I have a non-readable list
    When I visit my list
    Then I should see my list

    Examples:
      | User Type  |
      | registered |

  Scenario Outline: A user tries to view a non-findable list
    Given I am a <User Type> user
    When I visit a <List Type> list
    Then I should see a warning which reads "That list could not be found."
    And I should see my organizer

    Examples:
      | User Type  | List Type    |
      | registered | non-readable |
      | registered | non-existent |
      | anonymous  | non-readable |
      | anonymous  | non-existent |

  Scenario Outline: A user tries to view a publicly readable list
    Given I am a <User Type> user
    When I visit a publicly readable list
    Then I should see the list

    Examples:
      | User Type  |
      | registered |
      | anonymous  |
      | guest      |

  Scenario Outline: A guest tries to view a non-findable list
    Given I am a guest user
    When I visit a <List Type> list
    Then I should see a warning which reads "That list could not be found."
    And I should see a button reading "Create Checklist Now"

    Examples:
      | List Type    |
      | non-readable |
      | non-existent |
