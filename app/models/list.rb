class List
  include MongoThing::Document
  self.properties = [:items, :name, :notes]
  
  class << self
    def create_default
      create(:name => "New List", :items => [{:body => "", :completed_at => nil}])
    end
  end
end