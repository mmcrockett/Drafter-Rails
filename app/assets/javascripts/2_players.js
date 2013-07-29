var Player = Backbone.Model.extend({
  first_name: function(){return this.get("first_name");}
  ,last_name: function(){return this.get("last_name");}
  ,name: function(){return this.first_name() + ' ' + this.last_name();}
  ,league: function(){return this.get("league");}
  ,games: function(){return this.get("games");}
  ,pim: function(){return this.get("pim");}
  ,goals: function(){return this.get("goals");}
  ,assists: function(){return this.get("assists");}
  ,points: function(){
    if ((true == _.isFinite(this.goals())) && (true == _.isFinite(this.assists()))) {
      return this.goals() + this.assists();
    } else {
      return null;
    }
  }
  ,pick: function(){return this.get("pick");}
  ,team_id: function(){return this.get("team_id");}
  ,season_id: function(){return this.get("season_id");}
  ,position: function(){return this.get("position");}
  ,is_goalie: function(){
    var position = this.get("position");

    if (true == _.isString(position)) {
      return ("goalie" == position.toLowerCase());
    } else {
      return false;
    }
  }
  ,notes: function(){return this.get("notes");}
  ,defaults: function() {
    return {notes: []};
  }
  ,gdata_detailed: function(view){
    return [this.name(), view.season_name(this.season_id()), this.pick(), this.games(), this.points(), this.goals(), this.assists(), this.pim(), this.position(), this.league(), view.team_name(this.team_id()), this.notesToString()];
  }
  ,gdata: function(view){
    var last_pick;
    var last_team_id;

    _.forEach(view.detail_display_items(this), function(player_history, i, list) {
      if ((false == _.isFinite(last_pick)) && (true == _.isFinite(player_history.pick()))) {
        last_pick = player_history.pick();
      }
      if ((false == _.isFinite(last_team_id)) && (true == _.isFinite(player_history.team_id()))) {
        last_team_id = player_history.team_id();
      }
    });

    return [this.last_name(), this.first_name(), this.league(), this.position(), view.team_name(last_team_id), last_pick, this.notesToString()]
  }
  ,notesToString: function(){
    return this.notes().join('...');
  }
});

var PlayerCollection = Backbone.Collection.extend({
  model: Player
  ,gheaders_detailed: function() {
    return [
      {name:  'Name', type: 'string'}
      ,{name: 'Season', type: 'string'}
      ,{name: 'Pick', type: 'number'}
      ,{name: 'GP', type: 'number'}
      ,{name: 'P', type: 'number'}
      ,{name: 'G', type: 'number'}
      ,{name: 'A', type: 'number'}
      ,{name: 'PIM', type: 'number'}
      ,{name: 'Position', type: 'string'}
      ,{name: 'League', type: 'string'}
      ,{name: 'Team', type: 'string'}
      ,{name: 'Notes', type: 'string'}
    ];
  }
  ,gheaders: function() {
    return [
      {name:  'Last', type: 'string'}
      ,{name: 'First', type: 'string'}
      ,{name: 'League', type: 'string'}
      ,{name: 'Position', type: 'string'}
      ,{name: 'Team*', type: 'string'}
      ,{name: 'Pick*', type: 'number'}
      ,{name: 'Notes', type: 'string'}
    ];
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
    csv = csv.trim();
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
