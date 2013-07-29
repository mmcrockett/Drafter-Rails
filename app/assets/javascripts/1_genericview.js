var GenericView = Backbone.View.extend({
  bulk_input_default: "Position / Level,First Name,Last Name,Two League,Sharing,Out,Team Request,Other/Notes"
  ,sort: {column: 0, ascending: true}
  ,initialize: function(items, options) {
    var view = this;
    this.errors = this.items.clone();
    this.items.reset(items);
    this.single_add_button = jQuery('#single-add-button');
    this.single_add_input  = jQuery('#single-import-field');
    this.single_radio      = jQuery('#single-radio');
    this.bulk_add_button   = jQuery('#bulk-add-button');
    this.bulk_add_input    = jQuery('#bulk-import-field');
    this.bulk_add_input.html(this.bulk_input_default);
    this.bulk_radio        = jQuery('#bulk-radio');
    this.data_div          = jQuery('#data-div');
    this.detail_data_div   = jQuery('#detail-data-div');
    this.season_select     = jQuery('#season-select');
    this.single_note_add_button = jQuery('#single-note-add-button');
    this.single_note_add_input  = jQuery('#single-note-import-field');

    this.single_add_button.click(function(e){view.parse_input(view.single_add_input.val());view.single_add_input.val('');view.store();});
    this.single_add_input.keypress(function(e){if (13 == e.which) {view.single_add_input.blur();view.single_add_button.click(); return false;}});

    this.single_note_add_button.click(function(e){view.add_note(view.single_note_add_input.val());view.single_note_add_input.val('');});
    this.single_note_add_input.keypress(function(e){if (13 == e.which) {view.single_note_add_input.blur();view.single_note_add_button.click(); return false;}});

    this.bulk_add_button.click(function(){view.parse_csv(view.bulk_add_input.val());view.bulk_add_input.val(view.bulk_input_default);view.store();});

    this.single_radio.click(view.single_add_display);
    this.bulk_radio.click(view.bulk_add_display);

    this.single_radio.click();

    this.initialize_child(options);

    this.render();

    this.listenTo(this.items, 'sync', function() {
      view.render();
      view.display_detail_data();
    });
    this.listenTo(this.items, 'destroy', function() {
      view.clear_selection();
      view.render();
    });
    this.listenTo(this.items, 'error', function(model) {
      view.errors.push(model);
      jQuery.error('new-player', 'Issues saving: Highlighted in red in table.');
      view.items.remove(model);
    });

    jQuery.ready(jQuery(window).bind('keyup', function(e) {
      if (46 == e.keyCode) {
        view.delete_rows();
      }
    }));

    jQuery.ready(jQuery(window).scroll(function() {
      var y = jQuery(this).scrollTop();

      if (y >= 400) {
        view.detail_data_div.addClass('fixed');
      } else {
        view.detail_data_div.removeClass('fixed');
      }
    }));
  }
  ,add_note: function(value) {
    value = value.trim();
    if ((false == _.isEmpty(value)) && (true == _.isObject(this.selection))) {
      var item = this.selection.item;
      var note_column = _.indexOf(this.items.gheaders(), "Notes");

      _.each(value.split(';'), function(note,i,obj) {
        item.notes().push(note);
      }, this);

      if (-1 != note_column) {
        this.wrapper.getDataTable().setValue(this.selection.gitem.row, note_column, item.notesToString());
      }

      this.detail_data_wrapper.getDataTable().setValue(0, _.indexOf(this.items.gheaders_detailed(), "Notes"), item.notesToString())

      item.save();
    }
  }
  ,delete_rows: function() {
    var view = this;
    jQuery('#dialog-confirm').dialog({
      resizable: false,
      height:250,
      width:450,
      modal: true,
      buttons: {
        "Delete all items": function() {
          $(this).dialog("close");
          _.forEach(view.wrapper.getChart().getSelection(), function(gitem, i, obj) {
            item = view.items.findWhere({id: view.wrapper.getDataTable().getRowProperty(gitem.row, "player_id")});
            item.destroy();
          }, view);
        },
        Cancel: function() {
          $(this).dialog("close");
        }
      }
    });
  }
  ,selected_season: function() {
    return parseInt(this.season_select.selectBox().val());
  }
  ,season_name: function(id) {
    return this.season_select.find('option[value=' + id + ']').text();
  }
  ,season_pointhog: function(id) {
    return this.season_select.find('option[value=' + id + ']').attr('pointhog');
  }
  ,team_name: function(id) {
    var name = null;

    if (true == _.isNumber(id)) {
      if (true == _.isUndefined(this.teams)) {
        this.teams = new TeamCollection();
      }

      if (true == _.isUndefined(this.teams.get(id))) {
        this.teams.push(new Team({id:id}));
        this.teams.get(id).fetch({async:false});
      }

      name = this.teams.get(id).name();
    }

    return name;
  }
  ,bulk_add_display: function() {
    jQuery('.single-import').hide();
    jQuery('.bulk-import').show();
  }
  ,single_add_display: function() {
    jQuery('.bulk-import').hide();
    jQuery('.single-import').show();
  }
  ,parse_input: function(value) {
    this.items.unshift(view.new_item(v));
  }
  ,store: function() {
    this.errors.reset();
    jQuery.error('new-player');

    this.items.forEach(function(item, i, obj){
      if (true == item.isNew()) {
        item.save();
      }
    });
  }
  ,display_items: function() {
    return this.items;
  }
  ,detail_display_items: function(player) {
    return _.sortBy(this.items.where({last_name: player.last_name(), first_name: player.first_name()}), function(_player) {
      return -_player.season_id();
    });
  }
  ,set_selection: function() {
    if (true == _.isObject(this.selection)) {
      this.wrapper.getChart().setSelection([{row:this.selection.gitem.row}]);
    }
  }
  ,wrapper_ready: function() {
  }
  ,clear_selection: function() {
    this.selection = null;
    this.detail_data_div.hide();
  }
  ,store_selection: function() {
    var gitems = this.wrapper.getChart().getSelection();

    if (1 == gitems.length) {
      var item = this.items.findWhere({id: this.wrapper.getDataTable().getRowProperty(gitems[0].row, "player_id")});

      this.selection = {
        gitem: gitems[0]
        ,item: item
      };
    } /*else {
      //this.selection = null;
    }*/
  }
  ,data_div_widths: function() {
    var widths   = {pad: 30};
    widths.left  = Math.floor((jQuery('body').innerWidth()-widths.pad)*0.4);
    widths.right = jQuery('body').innerWidth() - widths.pad - widths.left;

    return widths;
  }
  ,render: _.throttle(function() {
    if (0 == this.data_div.length) {
      return;
    }
    var display_items = this.display_items();
    var data = new google.visualization.DataTable();
    var view = this;

    _.forEach(display_items.gheaders(), function(header, i, list) {
      data.addColumn(header.type, header.name);
    });

    if (0 != this.errors.length) {
      this.errors.forEach(function(item, i, list){
        var rowIndex = data.addRow(item.gdata(view));

        for (var j = 0; j < data.getNumberOfColumns(); j++) {
          data.setProperty(rowIndex, j, "style", "background-color:#FF7E7E;");
        }
      }, this);
    }

    if (0 != display_items.length) {
      display_items.forEach(function(item, i, list){
        var rowIndex = data.addRow(item.gdata(view));

        for (var j = 0; j < data.getNumberOfColumns(); j++) {
          if (true == item.isNew()) {
            data.setProperty(rowIndex, j, "style", "background-color:#CCFFFF;");
          } else if (true == item.error) {
            data.setProperty(rowIndex, j, "style", "background-color:#FF7E7E;");
          } else if (0 == j) {
            data.setRowProperty(rowIndex, "player_id", item.id);
          }
        }
      }, this);
    }

    if (true == _.isUndefined(this.wrapper)) {
      view.data_div.width(this.data_div_widths().left);
      this.wrapper = new google.visualization.ChartWrapper({
                      chartType: 'Table',
                      dataTable: data,
                      options: {showRowNumber: false, allowHtml: true, sortColumn: view.sort.column, sortAscending: view.sort.ascending},
                      containerId: view.data_div.attr('id')
                    });
      google.visualization.events.addListener(this.wrapper, 'ready', function() {
        google.visualization.events.addListener(view.wrapper, 'select', function(){view.store_selection();view.display_detail_data();});
      });
      google.visualization.events.addListener(this.wrapper, 'ready', function() {
        google.visualization.events.addListener(view.wrapper.getChart(), 'sort', function(e){
          view.sort.column    = e.column;
          view.sort.ascending = e.ascending;
        });
      });
    } else {
      this.wrapper.setOption('sortColumn',view.sort.column);
      this.wrapper.setOption('sortAscending',view.sort.ascending);
      this.wrapper.setDataTable(data);
    }

    this.wrapper.draw();
    google.visualization.events.addListener(this.wrapper, 'ready', function() {
      view.set_selection();
    });
    google.visualization.events.addListener(this.wrapper, 'ready', function() {
      view.wrapper_ready();
    });
  }, 800)
  ,display_detail_data: _.throttle(function() {
    if (true == _.isObject(this.selection)) {
      var data = new google.visualization.DataTable();
      var view = this;
      var display_items = this.detail_display_items(this.selection.item);

      _.forEach(this.items.gheaders_detailed(), function(header, i, list) {
        data.addColumn(header.type, header.name);
      });


      if (0 != display_items.length) {
        display_items.forEach(function(item, i, list){
          data.addRow(item.gdata_detailed(view));
        }, this);
      }

      if (true == _.isUndefined(this.detail_data_wrapper)) {
        jQuery('#detail-data-div').width(this.data_div_widths().right);
        this.detail_data_wrapper = new google.visualization.ChartWrapper({
                        chartType: 'Table',
                        dataTable: data,
                        options: {showRowNumber: false, allowHtml: true, sort: 'disable'},
                        containerId: 'detail-data-gchart-div'
                      });
      } else {
        this.detail_data_wrapper.setDataTable(data);
      }

      this.detail_data_wrapper.draw();
      this.detail_data_div.show();
    } /*else {
      this.detail_data_div.hide();
    }*/
  }, 800)
});

jQuery.errors = [];
jQuery.error = function(id, msg){
  if (true == _.isUndefined(msg)) {
    jQuery.errors = _.reject(jQuery.errors, function(o) {
      return (id == o.id);
    });
  } else {
    jQuery.errors.push({id:id, msg:msg});
  }
  jQuery.errorDisplay();
};
jQuery.errorDisplay = function(){
  var ediv = jQuery('#error-div');
  if (0 != jQuery.errors.length) {
    ediv.html('!ERROR: ' + _.last(jQuery.errors).msg);
    if (false == ediv.hasClass('error')) {
      ediv.addClass('error');
    }
  } else {
    ediv.html('');
    ediv.removeClass('error');
  }
};
_.number = function(v) {
  if (true == _.isFinite(v)) {
    return v;
  } else {
    return parseInt(v);
  }
};
_.toString = function(v) {
  if (true == _.isFinite(v)) {
    return v.toString();
  } else {
    return v;
  }
};
