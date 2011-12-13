class ApplicationController < ActionController::Base
  protect_from_forgery

  def redirect_back_or_home
    if request.env["HTTP_REFERER"]
      redirect_to :back
    else
      redirect_to root_path
    end
  end

  def create_anonymous_user
    unless user_signed_in?
      user = User.create_anonymous_user
      sign_in(user)
    end
  end
end
