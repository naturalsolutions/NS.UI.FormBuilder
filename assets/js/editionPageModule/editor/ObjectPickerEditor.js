define([
  'jquery', 'lodash', 'backbone',
  'backbone-forms'
], function ($, _, Backbone) {
  return Backbone.Form.editors.Select.extend({
    events: {
      'change': 'applyConfiguration'
    },

    /*
    options is used by backbone.Form to build select 
    it's an Array of object
    each object should be like that
    */
    defaultSchemaObjectInOptions: {
      val: '', //value send to server
      label: '', //value displayed in front
      wsUrl: '', //link for autocomplete
    },

    initialize: function (options) {
      this.options = options;
      Backbone.Form.editors.Select.prototype.initialize.call(this, options);
      this.checkConfig(); //TODO blocking if config not ok ? 
      this.buildObjConf();

    },

    checkConfig: function () {
      var config = this.schema.options;
      var error = false;

      for (var i = 0; i < config.length; i++) {
        var item = config[i];
        for (var key in this.defaultSchemaObjectInOptions) {
          if (!(key in item)) {
            error = true;
            break;
          }
        }

        if (error) {
          console.warn(" missing key " + key + " in item : ", item)
          break;
        }
      }

    },

    buildObjConf: function() {
      var config = this.schema.options; 
      this.confObj = {}
      for (var i = 0; i < config.length; i++) {
        var item = config[i];
        this.confObj[item.val] = item;   
      }
    },

    applyConfiguration: function (e) {

      if (e && 'delegateTarget' in e && 'selectedOptions' in e.delegateTarget && e.delegateTarget.selectedOptions[0]) {
        var value = e.delegateTarget.selectedOptions[0].value

        var updateObj = {
          name: this.confObj[value].val,
          objectType: this.confObj[value].val ,
          wsUrl :this.confObj[value].wsUrl,
        }

        this.model.set(
          updateObj,
          { trigger: false });
        }
     else {
        console.warn("hum something wrong with event send")
      }
    }
  });
});
