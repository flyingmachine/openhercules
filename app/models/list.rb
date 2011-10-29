class List
  include Mongoid::Document
  
  field :items, type: Array
  field :name,  type: String
  field :notes, type: String
  
  belongs_to :user
  
  class << self
    def create_default
      create(:name => "New List", :items => [{:body => "", :completed_at => nil}])
    end
  end
end