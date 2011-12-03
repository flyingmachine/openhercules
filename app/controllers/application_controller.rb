class ApplicationController < ActionController::Base
  protect_from_forgery

  def redirect_back_or_home
    if request.env["HTTP_REFERER"]
      redirect_to :back
    else
      redirect_to root_path
    end
  end
end
