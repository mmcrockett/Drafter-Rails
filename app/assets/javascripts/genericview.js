var GenericView = Backbone.View.extend({
  initialize: function(items, options) {
    var view = this;
    this.errors = this.items.clone();
    this.items.reset(items);
    this.single_add_button = jQuery('#single-add-button');
    this.single_add_input  = jQuery('#single-import-field');
    this.single_radio      = jQuery('#single-radio');
    this.bulk_add_button   = jQuery('#bulk-add-button');
    this.bulk_add_input    = jQuery('#bulk-import-field');
    this.bulk_radio        = jQuery('#bulk-radio');

    this.single_add_button.click(function(e){view.parse_input(view.single_add_input.val());view.single_add_input.val('');view.store();});
    this.single_add_input.keypress(function(e){if (13 == e.which) {view.single_add_input.blur();view.single_add_button.click(); return false;}});

    this.bulk_add_button.click(function(){view.parse_csv(view.bulk_add_input.val());view.bulk_add_input.val('');view.store();});

    this.single_radio.click(view.single_add_display);
    this.bulk_radio.click(view.bulk_add_display);

    this.single_radio.click();

    this.initialize_child(options);

    this.render();

    this.listenTo(this.items, 'sync', view.render);
    this.listenTo(this.items, 'error', function(model) {
      view.errors.push(model);
      jQuery.error('new-player', 'Issues saving players: Highlighted in red in table.');
      view.items.remove(model);
    });
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
  ,render: _.throttle(function() {
    var display_items = this.display_items();
    var data = new google.visualization.DataTable();

    jQuery.each(display_items.gheaders(), function(i,v){
      data.addColumn('string', v);
    });

    if (0 != this.errors.length) {
      this.errors.forEach(function(item, i, list){
        var rowIndex = data.addRow(item.gdata());

        for (var j = 0; j < data.getNumberOfColumns(); j++) {
          data.setProperty(rowIndex, j, "style", "background-color:#FF7E7E;");
        }
      }, this);
    }

    if (0 != display_items.length) {
      display_items.forEach(function(item, i, list){
        var rowIndex = data.addRow(item.gdata());

        if (true == item.isNew()) {
          for (var j = 0; j < data.getNumberOfColumns(); j++) {
            data.setProperty(rowIndex, j, "style", "background-color:#CCFFFF;");
          }
        } else if (true == item.error) {
          for (var j = 0; j < data.getNumberOfColumns(); j++) {
            data.setProperty(rowIndex, j, "style", "background-color:#FF7E7E;");
          }
        }
      }, this);
    }

    var wrapper = new google.visualization.ChartWrapper({
      chartType: 'Table',
      dataTable: data,
      options: {showRowNumber: false, allowHtml: true, sortColumn: 0},
      containerId: 'data-div'
    });

    wrapper.draw();
    google.visualization.events.addListener(wrapper, 'select', function(e){
      wrapper.getChart().getSelection();
    });
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
