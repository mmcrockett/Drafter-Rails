var Team = Backbone.Model.extend({
  name: function(){return this.get("name") || "";}
  ,draft_position: function(){return this.get("draft_position");}
  ,gdata: function(){
    return [this.name()]
  }
});

var TeamCollection = Backbone.Collection.extend({
  model: Team
  ,gheaders: function(){
    return ["Team"]
  }
  ,url: "/teams"
});

var TeamView = GenericView.extend({
  items: new TeamCollection()
  ,parse_input: function(value) {
    this.items.unshift(new Team({name: value.trim(), season_id:this.selected_season()}));
  }
  ,display_items: function() {
    return new TeamCollection(this.items.where({season_id:this.selected_season()}));
  }
  ,initialize_child: function(options) {
    var view = this;
    this.season_select.selectBox().change(function(){view.render();});
    jQuery('#radio-div').hide();
  }
});
