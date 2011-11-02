require 'spec_helper'

describe User do

  let(:user) { FactoryGirl.create(:user) }
  let(:user2) { FactoryGirl.create(:user) }

  describe ".add_list_share" do
    it "should add a list to list invitations" do
      list = List.create_default(user)
      user2.add_list_invitation(list, User::LIST_PERMISSIONS[0])
      
      user2.list_invitations.should == [{
        list_id: list.id.to_s,
        permission: User::LIST_PERMISSIONS[0]
      }]
    end
  end

end
