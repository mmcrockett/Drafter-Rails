class PlayersController < ApplicationController
  # GET /players
  # GET /players.json
  def index
    @players = Player.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => @players }
    end
  end

  # GET /players/1
  # GET /players/1.json
  def show
    id = params[:id]

    if (0 != id.to_i)
      @player = Player.find(params[:id])
      @playerdata = Player.where(:first_name => @player.first_name).where(:last_name => @player.last_name).order("season_id DESC")
      @title = "Draft - #{@player.first_name} #{@player.last_name}"
    else
      id = id.capitalize
      @playerdata = Player.where("first_name = ? OR last_name = ?", id, id).order("last_name ASC").order("first_name ASC").order("season_id DESC")
      @title = "Draft - Search - #{id}"
    end

    respond_to do |format|
      format.html # show.html.erb
      format.json { render :json => @player }
    end
  end

  # GET /players/new
  # GET /players/new.json
  def new
    @player = Player.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render :json => @player }
    end
  end

  # GET /players/1/edit
  def edit
    @player = Player.find(params[:id])
  end

  # POST /players
  # POST /players.json
  def create
    @player = Player.new(params[:player])
    @player.season = Season.find(params[:season_id])

    respond_to do |format|
      if @player.save
        format.html { redirect_to @player, :notice => 'Player was successfully created.' }
        format.json { render :json => @player, :status => :created, :location => @player }
      else
        format.html { render :action => "new" }
        format.json { render :json => @player.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /players/1
  # PUT /players/1.json
  def update
    @player = Player.find(params[:id])

    if (nil != params[:team_id])
      @player.team = Team.find(params[:team_id])
    else
      @player.team = nil
    end

    respond_to do |format|
      if @player.update_attributes(params[:player])
        format.html { redirect_to @player, :notice => 'Player was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render :action => "edit" }
        format.json { render :json => @player.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /players/1
  # DELETE /players/1.json
  def destroy
    @player = Player.find(params[:id])
    @player.destroy

    respond_to do |format|
      format.html { redirect_to players_url }
      format.json { head :no_content }
    end
  end
end
