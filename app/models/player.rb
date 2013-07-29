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

  def name
    return "#{self.first_name} #{self.last_name}"
  end

  def default_notes
    if (nil == self.notes)
      self.notes = []
    end
  end

  def goalie?
    if (nil == self.position) 
      return false
    elsif ("GOALIE".downcase == self.position.downcase)
      return true
    else
      return false
    end
  end

  def update_stats(league, gp, g, a, pim)
    gp  = gp.to_i
    g   = g.to_i
    a   = a.to_i
    pim = pim.to_i

    if ((false == self.goalie?) && ((nil == self.games) || (gp > self.games)))
      self.games   = gp
      self.assists = a
      self.goals   = g
      self.pim     = pim
      self.notes.delete_if do |v|
        (nil != v.match(/Pointhog .* Stats/))
      end
      #self.notes   << "Pointhog #{league} Stats"
      self.save()
    end
  end
end
