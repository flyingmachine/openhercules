Given /^I am a (.*?) user$/ do |user_type|
  if user_type == 'anonymous'
    anonymous_user_login
  elsif user_type == 'registered'
    registered_user_login
  end
end

Given /^I have a (.*?) list$/ do |list_type|
  if list_type == 'publicly readable'
    @list = FactoryGirl.create :list, :user => @current_user
    @list.global_permission = ListPermissions::READ
    @list.save
  end
end

When /^I try to view my list$/ do
  visit list_path(@list)
end

Then /^I should see my list$/ do
  page.should have_content(@list.name)
end
