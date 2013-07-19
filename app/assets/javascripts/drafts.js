var DraftView = GenericView.extend({
  items: new PlayerCollection()
  ,max_rows: 14
  ,order_template: _.template(
    '<ul id="sortable" style="width:<%= (teams.size() + 1) * width %>px;">'
    + '<% teams.forEach(function(team, i, obj) { %>'
    + '  <li id="<%= team.id %>" class="ui-state-default" style="width:<%= width %>px;">'
    + '    <div class="ui-widget-header"><%= team.name() %></div>'
    + '    <% _(14).times(function(i) { %>'
    + '    <div rid="<%= i %>" cid="<%= team.draft_position() %>" class="ui-widget-content"><%= name %></div>'
    + '    <% }) %>'
    + '  </li>'
    + '<% }) %>'
    + '</ul>'
    )
  ,initialize_child: function(options) {
    var view = this;
    this.season_select.selectBox().change(function(){view.render();view.render_draft();});
    this.draft_div = jQuery('#draft-div');
    this.teams = new TeamCollection();
    this.teams.reset(options.teams);
    this.refresh_time = options.timestamp;
    jQuery('#single-import-div').hide();
    jQuery('#bulk-import-div').hide();
    jQuery('#radio-div').hide();
    this.render_draft();
    this.refresh();
  }
  ,refresh: function() {
    return;
    var view = this;

    jQuery.getJSON('/drafts/' + view.refresh_time.getTime() + '.json').done(function(data) {
      view.refresh_time = new Date(data.server_time * 1000);
      _.forEach(data.players, function(updated_player, i, obj) {
        var _player = view.items.findWhere({id:updated_player.id});

        if (true == _.isObject(_player)) {
          _player.set(updated_player);
        } else {
          view.items.unshift(new Player(updated_player));
        }
      });
      view.render();
      view.render_draft();
    }).fail(function() {
      view.last_refresh = old_refresh_date;
    }).always(function() {
      setTimeout(function() {view.refresh();}, 7000);
    });
  }
  ,display_items: function() {
    return this.undrafted_players();
  }
  ,undrafted_players: function() {
    return new PlayerCollection(this.items.where({season_id:this.selected_season(), pick:null}));
  }
  ,drafted_players: function() {
    var selected_season_id = this.selected_season();

    return new PlayerCollection(this.items.filter(function(player){
      return ((selected_season_id == player.season_id()) && (false == _.isNull(player.pick())));
    }));
  }
  ,selected_teams: function() {
    return new TeamCollection(this.teams.where({season_id:this.selected_season()}));
  }
  ,save_draft_order: function() {
    _.forEach(jQuery('#sortable').sortable("toArray"), function(id, i, obj) {
      var team = this.teams.findWhere({id:parseInt(id)});
      team.set("draft_position",i);
      team.save();
    }, this);
  }
  ,paint_draft_board: function() {
    var steams = this.selected_teams();
    var view = this;
    var pick = 0;

    _(view.max_rows).times(function(row) {
      _(steams.size()).times(function(col) {
        if (0 == (row % 2)) {
          col = steams.size() - col - 1;
        }

        var elem = jQuery('div[rid=' + row + '][cid=' + col +']');
        var player = null; 
        var value  = "";
        var tid = steams.findWhere({draft_position:col}).id;

        if (0 == row) {
          elem.addClass("captain");
        } else {
          elem.removeClass("captain");
          pick += 1;
        }

        player = view.drafted_players().findWhere({team_id:tid,pick:pick});

        if (true == _.isEmpty(player)) {
          elem.removeClass("goalie");
          elem.addClass("emptypick");
          if (0 == row) {
            value = "captain";
          } else {
            value = "pick " + pick;
          }

          elem.droppable({
            drop: function(e, ui){
              var dropElem = jQuery(e.target);
              var dragElem = jQuery(ui.draggable);
              var _pick = parseInt(dropElem.attr('pick'));
              var _tid  = parseInt(dropElem.attr('tid'));
              var _pid  = parseInt(dragElem.attr('pid'));
              var _player = null;
            
              if (false == _.isFinite(_pid)) {
                if (true == _.isObject(view.selection)) {
                  _player = view.items.findWhere({id:view.selection.item.id});
                } else {
                  return false;
                }
              } else {
                _player = view.items.findWhere({id:_pid});
                dragElem.removeAttr('pid');
              }

              _player.set('team_id', _tid);
              _player.set('pick', _pick);
              _player.save();
              dropElem.attr('pid', _player.id);
              view.clear_selection();
              view.paint_draft_board();
            },
            hoverClass: "ui-state-highlight"
          });
        } else {
          elem.removeClass("emptypick");
          if (true == player.is_goalie()) {
            elem.addClass("goalie");
          }
          value = player.name();
          elem.draggable({
            revert:true,
            zIndex:99999
          });
          elem.dblclick(function() {
            player.set('team_id', null);
            player.set('pick', null);
            player.save();
            elem.removeAttr('pid');
            view.paint_draft_board();
          });
          elem.attr('pid', player.id);
        }

        elem.html(value);
        elem.attr("pick", pick);
        elem.attr("tid", tid);
      });
    });
  }
  ,create_div_from_tr: function(e) {
    var name = "Unknown McUnknowny";

    if (true == _.isObject(this.selection)) {
      name = this.selection.item.name();
    } else {
      return false;
    }

    return jQuery('<div id="player-drag">' + name + '</div>').appendTo('body');
  }
  ,wrapper_ready: function() {
    var view = this;
    jQuery('.google-visualization-table-td').draggable({
      zIndex:99999,
      refreshPositions:true,
      helper: function(e) {
        return view.create_div_from_tr(e);
      }
    });
  }
  ,render_draft: _.throttle(function() {
    var view = this;

    view.draft_div.html(view.order_template({teams: view.selected_teams(), width: 190}));

    if (0 == view.drafted_players().size()) {
      jQuery('#sortable').sortable({update: function(e, ui) {
        view.save_draft_order();
      }, axis: 'x'});
      view.save_draft_order();
      view.draft_div.html(view.order_template({teams: view.selected_teams(), width: 190}));
    }

    jQuery('#sortable').disableSelection();

    view.paint_draft_board();
  }, 800)
});
