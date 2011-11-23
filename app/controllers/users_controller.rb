class UsersController < ApplicationController
  def index
    users = params[:term].blank? ? [] : User.username_like(params[:term])
    users = users.collect{|u| {user_id: u._id, username: u.username}}
    render :json => users.to_json
  end

  def update
    current_user.lists_organized = params[:user][:lists_organized]
    current_user.save
    render :head => 200, :nothing => true
  end
end
