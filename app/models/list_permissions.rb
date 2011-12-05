module ListPermissions
  NONE = 'none'
  READ = 'read'
  WRITE = 'write'
  OWNER = 'owner'

  class << self
    def ordered
      [NONE, READ, WRITE, OWNER]
    end
  end
end
