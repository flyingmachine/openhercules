class List
  include Mongoid::Document
  include Mongoid::Timestamps
  
  field :items, type: Array
  field :name,  type: String
  field :description, type: String
  
  belongs_to :user
  
  default_scope order_by([[:created_at, :desc]])
  before_save :ensure_item_exists
  
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
        "This is your first list. It's a tutorial on using Checklist Hub. Try editing this text and hitting the 'escape' key.",
        "Escape toggles between editing mode and organization mode.",
        "Now hit the down arrow until this line of text is highlighted in blue. Then hit 'x'. This line should be indented.",
        "Now highlight this line and hit backspace or delete.",
        "The previous line should be deleted.",
        "You can hit 'enter' to add a new line, 'shift + enter' to add a new line before this one, and 'control + enter' to add a new line and indent it.",
        "Finally, you can press 'control + up' or 'control + down' to move a line up or down.",
        "That's it!"
      ]
      
      create(
        name:  "First List!",
        user:  user,
        items: [
          {
            body: "One list item",
            completed_at: nil
          },
          {
            body: "Another list item",
            completed_at: nil
          }
        ]
      )
    end
  end
  
  def ensure_item_exists
    if items.blank?
      self.items = [
        {
          body: "",
          completed_at: nil
        }
      ]
    end
  end
end