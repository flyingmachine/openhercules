require 'spec_helper'

describe List do

  let(:user) { FactoryGirl.create(:user) }
  let(:user2) { FactoryGirl.create(:user) }
  
  describe "#sharees" do
    it "should find all users which have received a list" do
      list = List.create_default(user)
      user2.receive_list(list, User::LIST_PERMISSIONS[0])
      
      list.sharees.should include(user2)
    end 
    
    it "should not include the owner of the list" do
      list = List.create_default(user)
      user2.receive_list(list, User::LIST_PERMISSIONS[0])
      
      list.sharees.should_not include(user)
    end
  end
end
