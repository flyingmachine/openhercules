module Login
  def registered_user_login
    @current_user = FactoryGirl.create :user
    visit root_path
    within('.log_in') do
      fill_in 'user_username', :with => @current_user.username
      fill_in 'user_password', :with => 'pass123.'
      click_on 'Log in'
    end
  end

  def anonymous_user_login
    visit root_path
    click_on "Create Checklist Now"
    @current_user = User.first
  end
end

World( Login )
