module ListsHelper
  def list_shares(list)
    list.sharees.collect do |u|
      {
        user_id: u.id.to_s,
        username: u.username,
        id: list.id.to_s,
        permission: u.permission_for(list)
      }
    end
  end

  def permission_for(list)
    return User::LIST_PERMISSIONS[0] unless user_signed_in?
    current_user.permission_for(@list)
  end
end
