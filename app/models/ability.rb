class Ability
  include CanCan::Ability

  def initialize(user)
    user ||= User.new

    can :read, List, :global_permission => ListPermissions::READ
    can :read, List, :global_permission => ListPermissions::WRITE
    can :read, List, :user_id => user.id
    can :read, List do |list|
      list.sharees.include? User
    end

    can :modify_items, List, :global_permission => ListPermissions::WRITE
    can :modify_items, List, :user_id => user.id
    can :modify_items, List do |list|
      list.writers.include? user.id.to_s
    end

    can :modify_properties, List, :user_id => user.id
  end
end
