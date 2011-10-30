class User
  include Mongoid::Document
  # Include default devise modules. Others available are:
  # :token_authenticatable, :encryptable, :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
         
  field :anonymous, type: Boolean
  field :username,  type: String
  
  has_many :lists
  
  validates_presence_of :username, :if => :username_required?
  validates_length_of :username, :within => 4..24, :allow_blank => true
  
  class << self
    def create_anonymous_user
      create(anonymous: true, remember_me: true)
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
    
end
