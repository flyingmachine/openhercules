class List
  include Mongoid::Document
  include Mongoid::Timestamps
  
  field :items, type: Array
  field :name,  type: String
  field :description, type: String
  
  belongs_to :user
  
  default_scope order_by([[:created_at, :desc]])
  before_save :ensure_item_exists
  before_create :add_to_list_organizer
  
  class << self
    def create_default(user)
      create(
        name:  "New List",
        user:  user,
        items: [{
          body: "",
          completed_at: nil
        }]
        
      )
    end
    
    def create_first(user)
      items = [
        "Try hitting 'escape' and editing this text. Hit 'escape' to save.",
        "Escape toggles between editing mode and organization mode.",
        "Now hit the down arrow until this line of text is highlighted in blue. Pressing 'x' will indent the line, and 'z' will outdent it.",
        "Now highlight this line and hit backspace or delete.",
        "The previous line should be deleted.",
        "'space' toggles the line's checkbox.",
        "'enter' adds a new line, 'shift + enter' adds a new line before this one, and 'control + enter' adds a new indented line.",
        "You can press 'control + up' or 'control + down' to move a line up or down.",
        "Clicking the wrench icon lets you change the list's name and description."
      ].collect{|i| {body: i}}
      
      if user.anonymous?
        children = [
          "Since you're an anonymous user, you can't log in on other browsers or privately share your lists with others.",
          "Once you sign up, you'll be able to use Checklist Hub fully.",
        ].collect{|i| {body: i}}
        
        items << {body: "For anonymous users:", children: children}
      end
      
      items <<  {body: "Have fun!"}
      
      create(
        name:  I18n.t(:first_list_title),
        user:  user,
        items: items
      )
    end
  end
  
  def sharees
    User.where('lists_organized.list_id' => self.id.to_s).and(:'lists_organized.permission'.ne => User::LIST_PERMISSIONS[2])
  end
  
  def ensure_item_exists
    if items.blank?
      self.items = [
        {
          body: ""
        }
      ]
    end
  end
  
  def add_to_list_organizer
    self.user.receive_list(self, User::LIST_PERMISSIONS[2])
  end
end