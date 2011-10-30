class List
  include Mongoid::Document
  
  field :items, type: Array
  field :name,  type: String
  field :notes, type: String
  
  belongs_to :user
  
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
end