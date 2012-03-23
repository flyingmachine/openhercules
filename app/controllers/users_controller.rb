class UsersController < ApplicationController
  def index
    users = params[:term].blank? ? [] : User.username_like(params[:term])
    users = users.collect{|u| {user_id: u._id, username: u.username}}
    render :json => users.to_json
  end

  def show
    @user = User.find(params[:id])
    @lists = @user.lists_organized_instantiated
    @lists.reject!{|l| !can?(:read, l)}
  end

  def update
    current_user.update_attributes params[:user]
    render :head => 200, :nothing => true
  end
end
