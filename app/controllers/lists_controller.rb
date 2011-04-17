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
end
