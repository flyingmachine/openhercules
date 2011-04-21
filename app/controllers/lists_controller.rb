class ListsController < ApplicationController
  def index
  end
  
  def show
    @list = List.find_one(params[:id])
  end
  
  def new
    list = List.create_default
    redirect_to(list)
  end
  
  def update
    @list = List.find_one(params[:id])
    @list.attributes = params.slice(*List.properties)
    @list.save
    render :status => 200, :text => "success"
  end
end
