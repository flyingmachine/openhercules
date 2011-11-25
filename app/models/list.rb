class List
  include Mongoid::Document
  include Mongoid::Timestamps
  
  field :items, type: Array
  field :name,  type: String
  field :description, type: String
  field :readers, type: Array, default: []
  field :writers, type: Array, default: []
  
  belongs_to :user
  
  default_scope order_by([[:created_at, :desc]])
  before_save  :ensure_item_exists
  after_create :add_to_list_organizer
  
  class << self    
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

  def clone(user)
    json = self.to_json
    json.gsub!(/"status":"checked"/, '"status":""')
    clone_attributes = JSON.parse(json)
    List.create(
      name: clone_attributes["name"],
      description: clone_attributes["description"],
      user: user,
      items: clone_attributes["items"]
    )          
  end
  
  def add_sharee(user_or_id, permission)
    id, user = User.user_and_id(user_or_id)
    return if user == self.user
    
    if permission == User::LIST_PERMISSIONS[0]
      self.readers |= [id]
      self.writers -= [id]
    else
      self.writers |= [id]
      self.readers -= [id]
    end
    save

    user.receive_list(self)
  end

  def remove_sharee(user_or_id)
    id, user = User.user_and_id(user_or_id)
    return if user == self.user
    
    self.readers -= [id]
    self.writers -= [id]

    user.remove_list(self)
    save
  end
  

  def as_json(options = {})
    {
      id: id,
      name: name,
      description: description,
      items: items
    }
  end
  
  def sharees
    (readers + writers).collect{|uid| User.find(uid)}
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
    self.user.receive_list(self)
  end
end
