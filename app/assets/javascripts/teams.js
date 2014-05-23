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
    return [{name: 'Team', type: 'string'}]
  }
  ,url: "/teams"
});

var TeamView = GenericView.extend({
  items: new TeamCollection()
  ,parse_input: function(value) {
    value = value.trim();

    if (false == _.isEmpty(value)) {
      jQuery.error('add-team');
      this.items.unshift(new Team({name: value, season_id:this.selected_season()}));
    } else {
      jQuery.error('add-team', 'Team Name is blank.');
    }
  }
  ,display_items: function() {
    return new TeamCollection(this.items.where({season_id:this.selected_season()}));
  }
  ,initialize_child: function(options) {
    var view = this;
    this.season_select.selectBox().change(function(){view.render();});
    jQuery('#radio-div').hide();
    this.copy_previous.show();
  }
});
