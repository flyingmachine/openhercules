class List
  include Mongoid::Document
  include Mongoid::Timestamps
  
  field :items, type: Array
  field :name,  type: String
  field :description, type: String
  field :readers, type: Array, default: []
  field :writers, type: Array, default: []
  field :global_permission, type: String
  field :show_tweet_this, type: Boolean, default: true
  field :show_facebook_like, type: Boolean, default: true
  field :shorturl, type: String
  
  belongs_to :user
  
  default_scope order_by([[:created_at, :desc]])
  before_save    :ensure_item_exists
  before_destroy :remove_all_sharees
  before_create  :set_global_permission
  before_create  :set_sharing_preferences
  before_create  :set_shorturl
  after_create   :add_to_list_organizer
  
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

  def clone(user, name, description)
    json = self.to_json
    json.gsub!(/"status":"checked"/, '"status":""')
    clone_attributes = JSON.parse(json)
    List.create(
      name: name,
      description: description,
      user: user,
      items: clone_attributes["items"]
    )
  end
  
  def add_sharee(user_or_id, permission)
    id, user = User.user_and_id(user_or_id)
    return if user == self.user
    
    if permission == ListPermissions::READ
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

  def remove_all_sharees
    sharees.each{|s| remove_sharee(s)}
    self.user.remove_list(self)
  end
  

  def as_json(options = {})
    {
      id: id,
      name: name,
      description: description,
      global_permission: global_permission,
      items: items,
      show_facebook_like: show_facebook_like,
      show_tweet_this: show_tweet_this
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

  def set_global_permission
    self.global_permission = (self.user && !self.user.anonymous? && ListPermissions::NONE) || ListPermissions::WRITE
  end

  def set_shorturl
    self.shorturl = Bitly.new(ENV['BITLY_USERNAME'], ENV['BITLY_API_KEY']).shorten("http://checklisthub.com/lists/#{self.id.to_s}").short_url
  end

  def set_sharing_preferences
    if self.user.anonymous?
      self.show_tweet_this = true
      self.show_facebook_like = true
    else
      self.show_tweet_this = false
      self.show_facebook_like = false
    end
    true
  end
end
