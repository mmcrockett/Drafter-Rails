var Import = Player.extend({
  gdata: function(){
    return [this.name(), this.games(), this.goals(), this.assists(), this.pim()];
  }
});

var ImportCollection = PlayerCollection.extend({
  model: Import
  ,gheaders: function() {
    return [
      {name:  'Name', type: 'string'}
      ,{name: 'GP', type: 'number'}
      ,{name: 'G', type: 'number'}
      ,{name: 'A', type: 'number'}
      ,{name: 'PIM', type: 'number'}
    ];
  }
});

var ImportView = PlayerView.extend({
  items: new ImportCollection()
  ,display_items: function() {
    return new ImportCollection(this.items.where({season_id:this.selected_season()}));
  }
  ,display_import_button: function() {
    var import_button = jQuery('#import-button');
    var indicator_gif = null;
    var pointhog_url  = this.season_pointhog(this.selected_season());
    var view = this;

    if (0 == import_button.length) {
      jQuery('#single-import-div').after('<img id="indicator-gif" src="/indicator.gif" style="display:none;"></img><button id="import-button">Import</button>');
      import_button = jQuery('#import-button');
      import_button.button();
    }

    indicator_gif = jQuery('#indicator-gif');

    if (false == _.isEmpty(pointhog_url)) {
      jQuery.error('import');
      import_button.show();
      import_button.click(function(){
        indicator_gif.show();
        jQuery.getJSON('/import/' + view.selected_season() + '.json').done(function(data) {
          indicator_gif.hide();
          view.items.reset(data);
          view.render();
        }).fail(function(jqxhr, textStatus, error) {
          indicator_gif.hide();
          jQuery.error('import', 'Request failed!: ' + textStatus + ', ' + error);
        });
      });
    } else {
      jQuery.error('import', 'Your season needs a pointhog url to import.');
      import_button.hide();
    }
  }
  ,initialize_child: function(options) {
    var view = this;
    this.season_select.selectBox().change(function(){view.clear_selection();view.display_import_button();view.render();});
    jQuery('#radio-div').hide();
    jQuery('#single-import-div').hide();
    this.display_import_button();
  }
});
