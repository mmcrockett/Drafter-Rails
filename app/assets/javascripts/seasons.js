var Season = Backbone.Model.extend({
  name: function(){return this.get("name") || "";}
  //,player_notes: function(){return this.get("player_notes") || [];}
  ,complete: function(){return this.get("complete") || 1;}
  ,pointhog: function(){return this.get("pointhog");}
  ,gdata: function(){
    var pointhog = this.pointhog();

    if (false == _.isString(pointhog)) {
      pointhog = '';
    }

    return [this.name(), pointhog];
  }
  /*,notesToString: function(){
    return this.player_notes().pluck('note').join('...');
  }*/
});

var SeasonCollection = Backbone.Collection.extend({
  model: Season
  ,gheaders: function(){return ["Season", "Pointhog URL"];}
  ,url: "/seasons"
});

var SeasonView = GenericView.extend({
  items: new SeasonCollection()
  ,initialize_child: function() {
    jQuery('#radio-div').hide();
  }
  ,parse_input: function(value) {
    this.items.unshift(new Season({name: value.trim()}));
  }
  ,data_div_widths: function() {
    var widths   = {pad: 10};
    widths.left  = Math.floor((jQuery('body').innerWidth()-widths.pad)*0.9);
    widths.right = jQuery('body').innerWidth() - widths.pad - widths.left;

    return widths;
  }
  ,wrapper_ready: function() {
    var view = this;
    jQuery('.google-visualization-table-td:last-of-type').editable(function(value, settings) {
      var season = view.items.findWhere({id:view.selection.item.id});
      season.set("pointhog", value);
      season.save();
    });
  }
  ,display_detail_data: function() {
  }
});
