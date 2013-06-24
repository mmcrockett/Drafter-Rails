class Season < ActiveRecord::Base
  attr_accessible :name, :complete
  has_many :players
end
