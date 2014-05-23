var PlayerDetailView = GenericView.extend({
  items: new PlayerCollection()
  ,initialize_child: function(options) {
    var view = this;
    jQuery('#single-import-div').hide();
    jQuery('#bulk-import-div').hide();
    jQuery('#season-select-div').hide();
    jQuery('#data-div').hide();
    jQuery('#radio-div').hide();
    jQuery('#menu').hide();
    jQuery('hr').hide();
    view.display_detail_data();
  }
  ,display_detail_data: _.throttle(function() {
    var data = new google.visualization.DataTable();
    var view = this;

    _.forEach(this.items.gheaders_detailed(), function(header, i, list) {
      data.addColumn(header.type, header.name);
    });


    if (0 != this.items.length) {
      this.items.forEach(function(item, i, list){
        var rowIndex = data.addRow(item.gdata_detailed(view));
        data.setRowProperty(rowIndex, "player_id", item.id);
      }, this);
    }

      if (true == _.isUndefined(this.detail_data_wrapper)) {
        this.detail_data_wrapper = new google.visualization.ChartWrapper({
                        chartType: 'Table',
                        dataTable: data,
                        options: {showRowNumber: false, allowHtml: true, sort: 'disable'},
                        containerId: 'detail-data-gchart-div'
                      });
      }

      this.detail_data_wrapper.draw();
  }, 800)
  ,add_note: function(value) {
    var view = this;
    value = value.trim();

    if (false == _.isEmpty(value)) {
      var note_column_detail_index = _.indexOf(_.pluck(view.items.gheaders_detailed(), 'name'), "Notes");
      var gitems = view.detail_data_wrapper.getChart().getSelection();
      var grow   = null;
      var item   = null;

      if (0 == gitems.length) {
        item = view.items.first();
        grow = 0;
      } else if (1 == gitems.length) {
        item = view.items.findWhere({id: view.detail_data_wrapper.getDataTable().getRowProperty(gitems[0].row, "player_id")});
        grow = gitems[0].row;
      } else {
        throw("Can't apply notes to multiple columns.");
      }

      if (-1 == note_column_detail_index) {
        throw("Note details are broken. Can't find column.");
      }

      _.each(value.split(';'), function(note,i,obj) {
        item.notes().push(note);
      }, view);

      if (-1 != note_column_detail_index) {
        view.detail_data_wrapper.getDataTable().setValue(grow, note_column_detail_index, item.notesToString());
        view.detail_data_wrapper.draw();
      }

      item.save();
    } 
  }
});
