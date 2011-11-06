class ListSharesController < ApplicationController
  before_filter :authenticate_user!
  
  def create

  end
  
  def update
    list = List.find(params[:id])
    if list.user != current_user
      render :head => 401, :nothing => true
    else
      user = User.find(params[:list_share][:user_id])
      user.receive_list(list, params[:list_share][:permission])
      render :head => 200, :nothing => true
    end
  end
end
