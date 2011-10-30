module ApplicationHelper
  def anonymous?
    !user_signed_in? || current_user.anonymous?
  end
end
