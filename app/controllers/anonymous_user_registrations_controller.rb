class AnonymousUserRegistrationsController < ApplicationController
  def create
    user = User.create_anonymous_user
    sign_in_and_redirect(user)
  end
  
  def edit
  end
  
  def update
  end
  
end