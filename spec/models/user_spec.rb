require 'spec_helper'

describe User do

  let(:user) { FactoryGirl.create(:user) }
  let(:user2) { FactoryGirl.create(:user) }
  let(:list) {FactoryGirl.create(:list, :user => user)}
  
  describe ".like" do
    it "should only return users where the username starts with the given text" do
      u1 = FactoryGirl.create(:user, :username => "george")
      u2 = FactoryGirl.create(:user, :username => "benny")
      
      User.username_like("geo").should == [u1]
      User.username_like("ben").should == [u2]
    end
  end

  describe "#receive_list" do
    it "should add a list to the list organizer if the user doesn't already have the list" do
      user2.receive_list(list)
      user2.lists_organized.should == [{
        "list_id"    => list.id.to_s
      }]
    end    
  end

  describe "#remove_list" do
    it "should remove a list from the list organizer" do
      user2.receive_list(list)
      user2.remove_list(list)
      user2.lists_organized.should == []
    end
  end
  
  describe "#permission_for" do
    it "should report the correct permissions for a list" do
      list.add_sharee(user2, ListPermissions::READ)
      user2.permission_for(list).should == ListPermissions::READ
    end
  end

end
