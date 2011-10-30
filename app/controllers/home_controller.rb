class HomeController < ApplicationController
  layout "spare"
  
  def show
    if user_signed_in?
      redirect_to lists_path
    end
  end
end
