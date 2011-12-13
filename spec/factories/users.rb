# Read about factories at http://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :user do
    sequence :username do |n|
      "user#{n}"
    end
    sequence :email do |n|
      "email#{n}@email.com"
    end
    password "pass123."
    password_confirmation "pass123."
    anonymous false
  end
  
  factory :anonymous_user, :class => User do
    anonymous true
  end
end
