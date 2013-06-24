var Season = Backbone.Model.extend({
  name: function(){return this.get("name") || "";}
  ,player_notes: function(){return this.get("player_notes") || [];}
  ,complete: function(){return this.get("complete") || 1;}
  ,url: "/seasons.json"
  ,gheaders: function(){return ["Season"]}
  ,gdata: function(){
    return [this.name()]
  }
  ,notesToString: function(){
    return this.player_notes().pluck('note').join('...');
  }
});

var SeasonCollection = Backbone.Collection.extend({
  model: Season
  ,url: "/seasons.json"
});

var SeasonView = GenericView.extend({
  items: new SeasonCollection()
  ,initialize_child: function() {
    jQuery('#radio-div').hide();
  }
  ,parse_input: function(value) {
    this.items.unshift(new Season({name: value.trim()}));
  }
});
