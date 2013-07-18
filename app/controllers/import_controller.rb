require 'rubygems'
require 'nokogiri'
require 'open-uri'

class ImportController < ApplicationController
  def index
  end

  def import
    season = Season.find(params[:id])
    players = season.players

    if (nil != season.pointhog)
      page = Nokogiri::HTML(open(season.pointhog))
      page.css('a[title$=Leaders]').each do |leader_anchor|
        league = leader_anchor['title'].gsub(" Scoring Leaders", "").gsub("View ", "")
        stats_page = Nokogiri::HTML(open("#{leader_anchor['href']}&ar=1"))
        stats_page.css('td a[href*=Player]').each do |player_anchor|
          tr   = player_anchor.parent.parent
          name = player_anchor.text().strip.downcase
          gp   = tr.css('td')[3].text()
          g    = tr.css('td')[4].text()
          a    = tr.css('td')[5].text()
          pim  = tr.css('td')[7].text()

          players.each do |player|
            if (player.name.downcase == name)
              player.update_stats(league, gp, g, a, pim)
              break
            end
          end
        end
      end
    end

    respond_to do |format|
      format.json { render :json => Player.all}
    end
  end
end
