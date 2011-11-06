class UsersController < ApplicationController
  def index
    users = params[:term].blank? ? [] : User.username_like(params[:term])
    users = users.collect{|u| {user_id: u._id, username: u.username, permission: User::LIST_PERMISSIONS[0] }}
    render :json => users.to_json
  end
end
