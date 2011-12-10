Given /^I am a (.*?) user$/ do |user_type|
  if user_type == 'anonymous'
    anonymous_user_login
  elsif user_type == 'registered'
    registered_user_login
  end
end

Given /^I have a (.*?) list$/ do |list_type|
  @list = FactoryGirl.create :list, :user => @current_user
  if list_type == 'publicly readable'
    @list.global_permission = ListPermissions::READ
  elsif list_type == 'non-readable'
    @list.global_permission = ListPermissions::NONE
  end
  @list.save
end

When /^I try to view my list$/ do
  visit list_path(@list)
end

When /^I try to view a (.*?) list$/ do |list_type|
  if list_type == 'non-readable' || list_type == 'publicly readable'
    @other_user = FactoryGirl.create :user
    @list = FactoryGirl.create :list, :user => @other_user
    @list.global_permission = ListPermissions::NONE if list_type == 'non-readable'
    @list.global_permission = ListPermissions::READ if list_type == 'publicly readable'
    @list.save
    visit list_path(@list)
  elsif list_type == 'non-existent'
    visit list_path(:id => 'nonexistent')
  end
end

Then /^I should see (?:the|my) list$/ do
  page.should have_content(@list.name)
end

Then /^I should see a warning which reads "(.*?)"$/ do |warning|
  page.should have_content(warning)
end

Then /^I should see my organizer$/ do
  page.should have_css('.organizer')
end

