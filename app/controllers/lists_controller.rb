class ListsController < ApplicationController
  def index
  end
  
  def show
    @list = List.find(params[:id])
  end
  
  def new
    list = List.create_default
    redirect_to(list)
  end
  
  def update
    @list = List.find(params[:id])
    @list.update_attributes(params[:list])
    @list.save
    render :status => 200, :text => "success"
  end
end
