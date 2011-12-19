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

  def owner?(list)
    list.user == @current_user
  end

  def permissions_for(list)
    @permissions ||= {
      :read => can?(:read, list),
      :modify_items => can?(:modify_items, list),
      :modify_properties => can?(:modify_properties, list),
      :add_sharees => can?(:add_sharees, list)
    }
  end
end
