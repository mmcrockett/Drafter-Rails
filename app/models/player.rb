class Player < ActiveRecord::Base
  include JSONNoDates
  belongs_to :season
  belongs_to :team
  attr_accessible :assists, :first_name, :games, :goals, :last_name, :league, :notes, :pick, :pim, :position

  serialize :notes, JSON

  before_save  :capitalize_first_name
  before_save  :capitalize_last_name
  before_save  :default_notes

  def capitalize_first_name
    self.first_name.strip!
    self.first_name.downcase!
    self.first_name = self.first_name.titlecase
  end

  def capitalize_last_name
    self.last_name.strip!
    self.last_name.downcase!
    self.last_name = self.last_name.titlecase
  end

  def default_notes
    if (nil == self.notes)
      self.notes = []
    end
  end
end
