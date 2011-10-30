class ListsController < ApplicationController
  before_filter :authenticate_user!, :except => :show
   
  def index
    if current_user.lists.empty?
      List.create_default(current_user)
    end
    
    redirect_to current_user.last_viewed_list || current_user.lists.first
  end
  
  def show
    @list = List.find(params[:id])
    if user_signed_in?
      current_user.update_attribute(:last_viewed_list_id, @list.id)
      @lists = current_user.lists
    end
  end
    
  def create
    list = current_user.lists.create(name: params[:name], notes: params[:notes])
    redirect_to(list)
  end
  
  def update
    @list = List.find(params[:id])
    @list.update_attributes(params[:list])
    @list.save
    render :status => 200, :text => "success"
  end
end
