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
  field :list_invitations,    type: Array
  
  has_many :lists
  
  validates_presence_of :username, :if => :username_required?
  validates_uniqueness_of :username
  validates_length_of :username, :within => 4..24, :allow_blank => true
  
  LIST_PERMISSIONS = [
    "read",
    "read + write"
  ]
  
  class << self
    def create_anonymous_user
      create(anonymous: true, remember_me: true, password: "anonymous", password_confirmation: "anonymous")
    end
  end
  
  def email_required?
    !anonymous
  end
  
  def password_required?
    !anonymous || super
  end
  
  def username_required?
    !anonymous
  end
  
  def last_viewed_list
    List.find(last_viewed_list_id) if last_viewed_list_id
  end
  
  def add_list_invitation(list, permission)
    self.list_invitations ||= []
    self.list_invitations << {
      list_id: list.id.to_s,
      permission: permission
    }
    save
  end
    
end
