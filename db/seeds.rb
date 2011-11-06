# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ :name => 'Chicago' }, { :name => 'Copenhagen' }])
#   Mayor.create(:name => 'Emanuel', :city => cities.first)

10.times do
  User.create(
    username: Faker::Name.first_name.downcase.gsub(/.[^a-zA-Z0-9]/, '_'),
    password: 'pass123.',
    password_confirmation: 'pass123.',
    email: Faker::Internet.email
  )
end