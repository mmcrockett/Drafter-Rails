class CreatePlayers < ActiveRecord::Migration
  def change
    create_table :players do |t|
      t.string :first_name, :null => false
      t.string :last_name, :null => false
      t.integer :goals
      t.integer :assists
      t.integer :pim
      t.integer :games
      t.integer :pick
      t.string :position
      t.string :league
      t.string :notes
      t.references :season, :null => false
      t.references :team

      t.timestamps
    end
    add_index :players, :season_id
    add_index :players, :team_id
  end
end
