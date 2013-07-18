class Season < ActiveRecord::Base
  attr_accessible :name, :complete, :pointhog
  has_many :players
  has_many :teams
end
