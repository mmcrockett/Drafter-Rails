class DraftsController < ApplicationController
  # GET /drafts
  # GET /drafts.json
  def index
    @teams   = Team.all
    @players = Player.where("league LIKE ? OR pick IS NOT NULL", "%B1%")

    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => @drafts }
    end
  end

  # GET /drafts/1
  # GET /drafts/1.json
  def show
    refresh_date = Time.at(params[:id].to_i/1000)
    player_updates = Player.where("updated_at > ?", refresh_date)

    respond_to do |format|
      format.html # show.html.erb
      format.json { render :json => {:server_time => Time.now.to_i, :players => player_updates}}
    end
  end

  # GET /drafts/new
  # GET /drafts/new.json
  def new
    @draft = Draft.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render :json => @draft }
    end
  end

  # GET /drafts/1/edit
  def edit
    @draft = Draft.find(params[:id])
  end

  # POST /drafts
  # POST /drafts.json
  def create
    @draft = Draft.new(params[:draft])

    respond_to do |format|
      if @draft.save
        format.html { redirect_to @draft, :notice => 'Draft was successfully created.' }
        format.json { render :json => @draft, :status => :created, :location => @draft }
      else
        format.html { render :action => "new" }
        format.json { render :json => @draft.errors, :status => :unprocessable_entity }
      end
    end
  end

  # PUT /drafts/1
  # PUT /drafts/1.json
  def update
    @draft = Draft.find(params[:id])

    respond_to do |format|
      if @draft.update_attributes(params[:draft])
        format.html { redirect_to @draft, :notice => 'Draft was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render :action => "edit" }
        format.json { render :json => @draft.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /drafts/1
  # DELETE /drafts/1.json
  def destroy
    @draft = Draft.find(params[:id])
    @draft.destroy

    respond_to do |format|
      format.html { redirect_to drafts_url }
      format.json { head :no_content }
    end
  end
end
