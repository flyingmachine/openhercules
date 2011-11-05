class UsersController < ApplicationController
  def index
    users = User.username_like(params[:q])
    users = users.collect{|u| {id: u._id, username: u.username }}
    render :json => users.to_json
  end
end
