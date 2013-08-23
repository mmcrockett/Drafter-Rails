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

    return [this.id, this.name(), pointhog];
  }
});

var SeasonCollection = Backbone.Collection.extend({
  model: Season
  ,gheaders: function() {
    return [
      {name:  'Id', type: 'number'}
      ,{name:  'Season', type: 'string'}
      ,{name: 'Pointhog URL', type: 'string'}
    ];
  }
  ,url: "/seasons"
});

var SeasonView = GenericView.extend({
  items: new SeasonCollection()
  ,initialize_child: function() {
    this.sort.ascending = false;
    jQuery('#radio-div').hide();
  }
  ,parse_input: function(value) {
    value = value.trim();

    if (false == _.isEmpty(value)) {
      jQuery.error('add-season');
      this.items.unshift(new Season({name: value}));
    } else {
      jQuery.error('add-season', 'Season Name is blank.');
    }
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
