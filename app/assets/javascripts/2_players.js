var Player = Backbone.Model.extend({
  first_name: function(){return this.get("first_name");}
  ,last_name: function(){return this.get("last_name");}
  ,name: function(){return this.first_name() + ' ' + this.last_name();}
  ,league: function(){return this.get("league");}
  ,goals: function(){return this.get("goals");}
  ,assists: function(){return this.get("assists");}
  ,pick: function(){return this.get("pick");}
  ,team_id: function(){return this.get("team_id");}
  ,season_id: function(){return this.get("season_id");}
  ,position: function(){return this.get("position");}
  ,is_goalie: function(){
    return ("goalie" == this.get("position").toLowerCase());
  }
  ,notes: function(){return this.get("notes");}
  ,defaults: function() {
    return {notes: []};
  }
  ,gdata_detailed: function(view){
    return [this.name(), view.season_name(this.season_id()), _.toString(this.pick()), _.toString(this.goals()), _.toString(this.assists()), this.position(), this.league(), view.team_name(this.team_id()), this.notesToString()];
  }
  ,gdata: function(){
    return [this.last_name(), this.first_name(), this.league(), this.position(), this.notesToString()]
  }
  ,notesToString: function(){
    return this.notes().join('...');
  }
});

var PlayerCollection = Backbone.Collection.extend({
  model: Player
  ,gheaders_detailed: function() {
    return ["Name", "Season", "Pick", "G", "A", "Position", "League", "Team", "Notes"];
  }
  ,gheaders: function(){
    return ["Last", "First", "League", "Position", "Notes"]
  }
  ,url: "/players"
});

var PlayerView = GenericView.extend({
  items: new PlayerCollection()
  ,display_items: function() {
    return new PlayerCollection(this.items.where({season_id:this.selected_season()}));
  }
  ,add_player: function(player, notes) {
    player.season_id = this.selected_season();
    player = new Player(player);
    player.set("notes", notes);

    this.items.unshift(player);
  }
  ,parse_csv: function(csv) {
    _.each(jQuery.csv.toObjects(csv), function(csv,i) {
      var player  = {};
      var notes   = [];
      _.each(csv, function(v,k) {
        k = k.trim();
        v = v.trim();
        var lower_k = k.toLowerCase();

        if (-1 != lower_k.indexOf('first')) {
          player.first_name = v;
        } else if (-1 != lower_k.indexOf('last')) {
          player.last_name = v;
        } else if (-1 != lower_k.indexOf('position')) {
          var parts = v.split('-');
          player.position = parts[0];
          player.league = parts[1];
        } else if (false == _.isEmpty(v)) {
          notes.push(k + ' ' + v);
        }
      });
      this.add_player(player, notes);
    }, this);
  }
  ,initialize_child: function(options) {
    var view = this;
    this.season_select.selectBox().change(function(){view.clear_selection();view.render();});
  }
  ,add_note: function(value) {
    value = value.trim();
    if ((false == _.isEmpty(value)) && (true == _.isObject(this.selection))) {
      var item = this.selection.item;

      _.each(value.split(';'), function(note,i,obj) {
        item.notes().push(note);
      }, this);

      this.wrapper.getDataTable().setValue(this.selection.gitem.row, _.indexOf(this.items.gheaders(), "Notes"), item.notesToString());
      this.player_data_wrapper.getDataTable().setValue(0, _.indexOf(this.items.gheaders_detailed(), "Notes"), item.notesToString())

      item.save();
    }
  }
  ,parse_input: function(value) {
    var player = {};
    var notes  = [];

    if (-1 != value.indexOf(';')) {
      var parts = value.split(';');
      value = parts.shift();
      notes = parts;
    }

    if (-1 != value.indexOf(',')) {
      var parts = value.split(',');

      player.first_name = parts[1]
      player.last_name  = parts[0]
    } else {
      var parts = value.split(' ');

      _.each(parts, function(part, i, obj) {
        if (0 == i) {
          player.first_name = part;
        } else if (true == _.isUndefined(player.last_name)) {
          player.last_name  = part;
        } else {
          player.last_name  += ' ' + part;
        }
      });
    }

    this.add_player(player, notes);
  }
});
