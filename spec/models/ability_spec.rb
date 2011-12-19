require 'spec_helper'

describe Ability do
  let(:user) { FactoryGirl.create(:user) }
  let(:user2) { FactoryGirl.create(:user) }
  let(:list) { FactoryGirl.create(:list, :user => user, global_permission: ListPermissions::NONE) }
  let(:user_ability) { Ability.new(user) }
  let(:user2_ability) { Ability.new(user2) }
  
  describe "read" do
    it "should let a user read a list if the list's global permission is read" do
      list.update_attributes(global_permission: ListPermissions::READ)
      user2_ability.should be_able_to(:read, list)
    end
    
    it "should let a user read a list if the list's global permission is write" do
      list.update_attributes(global_permission: ListPermissions::WRITE)
      user2_ability.should be_able_to(:read, list)
    end
    
    it "should let a user read a list if the user owns the list" do
      user_ability.should be_able_to(:read, list)
    end
    
    it "should let a user read a list if the user is a sharee with read privilege" do
      list.add_sharee(user2, ListPermissions::READ)
      user2_ability.should be_able_to(:read, list)
    end

    it "should let a user read a list if the user is a sharee with write privilege" do
      list.add_sharee(user2, ListPermissions::WRITE)
      user2_ability.should be_able_to(:read, list)
    end

    it "should otherwise not let a user read a list" do
      user2_ability.should_not be_able_to(:read, list)
    end
  end

  describe "modify_items" do
    it "should let a user modify items if the list's global permission is write" do
      list.update_attributes(global_permission: ListPermissions::WRITE)
      user2_ability.should be_able_to(:modify_items, list)
    end

    it "should not let a user modify items if the list's global permission is read" do
      list.update_attributes(global_permission: ListPermissions::READ)
      user2_ability.should_not be_able_to(:modify_items, list)
    end

    it "should not let a user modify items if the list's global permission is none" do
      list.update_attributes(global_permission: ListPermissions::NONE)
      user2_ability.should_not be_able_to(:modify_items, list)
    end

    it "should let a user modify items if the user owns the list" do
      user_ability.should be_able_to(:modify_items, list)
    end

    it "should let a user modify items if the user is a sharee with write privilege" do
      list.add_sharee(user2, ListPermissions::WRITE)
      user2_ability.should be_able_to(:modify_items, list)
    end

    it "should not let a user modify items if the user is a sharee with read privilege" do
      list.add_sharee(user2, ListPermissions::READ)
      user2_ability.should_not be_able_to(:modify_items, list)
    end
  end

  describe "modify_properties" do
    it "should let a user modify properties if the user owns the list" do
      user_ability.should be_able_to(:modify_properties, list)
    end

    it "should not let the user modify properties if the user does not own the list" do
      user2_ability.should_not be_able_to(:modify_properties, list)
    end
  end
end
