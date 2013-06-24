var Player = Backbone.Model.extend({
  first_name: function(){return this.get("first_name") || "";}
  ,last_name: function(){return this.get("last_name") || "";}
  ,league: function(){return this.get("league") || "";}
  ,position: function(){return this.get("position") || "";}
  ,notes: function(){return this.get("notes") || [];}
  ,url: "/players.json"
  ,gdata: function(){
    return [this.last_name(), this.first_name(), this.league(), this.position(), this.notesToString()]
  }
  ,notesToString: function(){
    return this.notes().join('...');
  }
});

var PlayerCollection = Backbone.Collection.extend({
  model: Player
  ,gheaders: function(){
    return ["Last", "First", "League", "Position", "Notes"]
  }
  ,url: "/players.json"
});

var PlayerView = GenericView.extend({
  items: new PlayerCollection()
  ,display_items: function() {
    return new PlayerCollection(this.items.where({season_id:this.selected_season()}));
  }
  ,selected_season: function() {
    return parseInt(this.season_select.selectBox().val());
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
    this.season_select = jQuery('#season-select');
    this.season_select.selectBox().change(function(){view.render();});
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
