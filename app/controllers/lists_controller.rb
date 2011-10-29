class ListsController < ApplicationController
  before_filter :authenticate_user!
  
  def index
    redirect_to current_users.lists.first
  end
  
  def show
    @list = current_user.lists.find(params[:id])
    @lists = current_user.lists
  end
  
  def new
    list = List.create_default(current_user)
    redirect_to(list)
  end
  
  def update
    @list = List.find(params[:id])
    @list.update_attributes(params[:list])
    @list.save
    render :status => 200, :text => "success"
  end
end
