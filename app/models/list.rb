class List
  include Mongoid::Document
  include Mongoid::Timestamps
  
  field :items, type: Array
  field :name,  type: String
  field :notes, type: String
  
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