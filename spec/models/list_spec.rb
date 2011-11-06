require 'spec_helper'

describe List do

  let(:user) { FactoryGirl.create(:user) }
  let(:user2) { FactoryGirl.create(:user) }
  
  describe "#sharees" do
    it "should find all users which have received a share invitation" do
      list = List.create_default(user)
      user2.receive_list(list, User::LIST_PERMISSIONS[0])
      
      list.sharees.should include(user2)
    end    
  end
end
