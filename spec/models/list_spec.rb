require 'spec_helper'

describe List do

  let(:user) { FactoryGirl.create(:user) }
  let(:user2) { FactoryGirl.create(:user) }
  let(:list) {FactoryGirl.create(:list, :user => user)}
  
  describe "#sharees" do
    it "should find all users which have received a list" do
      list.add_sharee(user2, User::LIST_PERMISSIONS[0])
      list.sharees.should include(user2)
    end 
    
    it "should not include the owner of the list" do
      list.add_sharee(user, User::LIST_PERMISSIONS[0])
      list.sharees.should_not include(user)
    end

    describe "#remove_sharee" do
      it "should remove a user from readers and writers, and remove the list from that person's organizer" do
        list.add_sharee(user2, User::LIST_PERMISSIONS[0])
        list.remove_sharee(user2)
        list.sharees.should_not include(user)
        user2.lists_organized.should == []
      end

      it "should not remove a list from the owner's lists_organized" do
        list.remove_sharee(user)
        user.reload.lists_organized.should_not be_blank
      end
    end
  end
  
  describe "after_create" do
    it "should add the list to the owner's lists_organized" do
      list.user.lists_organized.should == [{
        "list_id"    => list.id.to_s
      }]
    end
  end

  describe "#clone" do
    it "should return a new list where each status is not checked" do
      list.items = [{"body" => "", "status" => "checked", "children" => [{"body" => "", "status" => "checked"}]}]
      new_list = list.clone(user, 'list', 'description')
      new_list.items.first["status"].should == ""
      new_list.items.first["children"].first["status"].should == ""
    end
  end

  describe "#destroy" do
    it "should remove the list from all sharee's 'lists_organized'" do
      list.destroy
      user.reload.lists_organized.should == []
    end
  end
end
