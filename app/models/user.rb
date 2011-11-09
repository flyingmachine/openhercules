class User
  include Mongoid::Document
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
         
  field :anonymous,           type: Boolean
  field :username,            type: String
  field :email,               type: String
  field :last_viewed_list_id, type: Integer
  field :organized_lists,     type: Array
  field :lists_organized,     type: Array,  default: []
  
  has_many :lists
  
  validates_presence_of   :username, :if => :username_required?
  validates_uniqueness_of :username, :allow_blank => true
  validates_length_of     :username, :within => 4..24, :allow_blank => true
  
  LIST_PERMISSIONS = [
    "read",
    "read-write",
    "owner"
  ]
  
  scope :username_like, ->(username) { where("username" => /^#{username}/) }
  
  class << self
    def create_anonymous_user
      create(anonymous: true, remember_me: true, password: "anonymous", password_confirmation: "anonymous")
    end
  end
  
  def email_required?
    !anonymous
  end
  
  def password_required?
    !anonymous && super
  end
  
  def username_required?
    !anonymous
  end
  
  def last_viewed_list
    List.find(last_viewed_list_id) if last_viewed_list_id
  end
      
  def receive_list(list, permission)
    list_info = {
      "list_id" => list.id.to_s,
      "permission" => permission
    }
    
    if has_received_list?(list)
      update_shared_list(list_info)
    else
      add_list_invitation(list_info)
    end
    save
  end
  
  def add_list_invitation(list_info)
    self.lists_organized << list_info
  end
  
  def update_shared_list(list_info)
    User.collection.update(
      {_id: self.id,  'lists_organized.list_id' => list_info["list_id"]},
      {"$set" => {"lists_organized.$.permission" => list_info["permission"]}}
    )
  end
  
  def has_received_list?(list)
    self.lists_organized.collect{|i| i["list_id"]}.include? list.id.to_s
  end
  
  def permission_for(list)
    invitation = self.lists_organized.find{|l| l["list_id"] == list.id.to_s}
    invitation["permission"] if invitation
  end
    
end