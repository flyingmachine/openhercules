class ListSharesController < ApplicationController
  before_filter :authenticate_user!
  
  def create
    list = List.find(params[:id])
    if list.user != current_user
      render :head => 401
    else
      user = User.find(params[:list_share][:user_id])
      user.receive_list(list, params[:list_share][:permission])
      render :head => 200
    end
  end
  
  def update
    return create
  end
end
