# Read about factories at http://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :list do
    name 'New List'
    items [{
      body: "",
      completed_at: nil
    }]
  end
end
