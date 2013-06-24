# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20130624195149) do

  create_table "players", :force => true do |t|
    t.string   "first_name", :null => false
    t.string   "last_name",  :null => false
    t.integer  "goals"
    t.integer  "assists"
    t.integer  "pim"
    t.integer  "games"
    t.integer  "pick"
    t.string   "position"
    t.string   "league"
    t.string   "notes"
    t.integer  "season_id",  :null => false
    t.integer  "team_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "players", ["season_id"], :name => "index_players_on_season_id"
  add_index "players", ["team_id"], :name => "index_players_on_team_id"

  create_table "seasons", :force => true do |t|
    t.string   "name",                      :null => false
    t.integer  "complete",   :default => 0
    t.datetime "created_at",                :null => false
    t.datetime "updated_at",                :null => false
  end

  create_table "teams", :force => true do |t|
    t.string   "name",       :null => false
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

end
