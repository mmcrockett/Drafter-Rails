class Team < ActiveRecord::Base
  attr_accessible :name, :draft_position
  belongs_to :season
  has_many :players
end
