class AnonymousUserRegistrationsController < ApplicationController
  before_filter :authenticate_user!, :only => [:update]
  
  layout "spare"
  
  def create
    user = User.create_anonymous_user
    sign_in_and_redirect(user)
  end
  
  def edit
  end
  
  def update
    params[:user].merge!({
      anonymous: false,
      current_password: "anonymous"
    })
    
    if current_user.update_with_password(params[:user])
      sign_in :user, user, :bypass => true
      redirect_to lists
    else
      current_user.clean_up_passwords
      render :edit
    end
  end
  
end