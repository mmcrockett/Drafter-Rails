class CreateSeasons < ActiveRecord::Migration
  def change
    create_table :seasons do |t|
      t.string :name, :null => false
      t.integer :complete, :default => 0
      t.string :pointhog

      t.timestamps
    end
  end
end
