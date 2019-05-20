/**
 * Created by David on 22/12/2015.
 */

define([
  'jquery',
  'backbone',
  '../models/Fields',
  '../editor/CheckboxEditor',
  '../editor/NumberEditor',
  'backbone.radio',
  '../../Translater',
  'auth',
  'text!../templates/FieldTemplate.html'
], function ($, Backbone, Fields, CheckboxEditor, NumberEditor, Radio, translater, auth, FieldTemplate) {

  var fieldTemplate = _.template(FieldTemplate);

  return {
    extensionData: null,
    schemaExtention: {

    },

    propertiesDefaultValues : {

    },

    getExtractedDatas: function() {
      return {};
    },
    getSchemaExtention: function(options){
      if (this.extensionData) {
        return this.extensionData;
      }
      if (options) {
        this.initializeExtention(options);
      }
      return this.schemaExtention;
    },
    initializeExtention: function (options) {
      this.getPositionDatas(options);
    },

    jsonExtention: function (originalForm) {
      return(this.propertiesDefaultValues);
    },
    updateAttributesExtention: function () {
      return true;
    },

    setSelectValues: function(datas, schema)
    {
      var getJSONForSelectOptions = function(valuesArray)
      {
        $.each(valuesArray, function(index, value){
          valuesArray[index] = {label: value, val: value};
        });
        return(valuesArray);
      };

      if (datas)
      {
        var that = this;
        $.each(JSON.parse(datas), function(index, value)
        {
          var values = [];
          for(var ind in value)
            values.push(ind);

          var valtoset = getJSONForSelectOptions(values.sort());

          if (schema[index.substr(0,1).toLowerCase()+index.substr(1)])
            schema[index.substr(0,1).toLowerCase()+index.substr(1)].options = valtoset;
          else
          {
            var arrayToSet = [];
            $.each(valtoset, function(index, value){
              if(value.val)
                value = value.val;
              arrayToSet.push(value);
            });

            that[index.substr(0,1).toLowerCase()+index.substr(1)] = arrayToSet;
          }
        });
      }

      return (schema);
    },

    getPositionDatas: function (options) {
      if (!this.extensionData) {
        $.ajax({
          data: JSON.stringify({'datas' : this.getExtractedDatas()}),
          type: 'POST',
          url: options.paths.positionWSPath + "/getTypes",
          contentType: 'application/json',
          crossDomain: true,
          async: true,
          success: _.bind(function (data) {
            this.extensionData = this.setSelectValues(data, this.schemaExtention);
            if (this.callback) {
              this.callback(this.extensionData);
            }
            this.callback = null;
          }, this),
          error: _.bind(function (xhr) {
            console.log("error ! " + xhr);
          }, this)
        });
      }

      return this.extensionData;
    },

    withCallback: function(callback) {
      // we have data available, just apply the callback
      if (this.extensionData) {
        callback(this.extensionData);
      } else {
        // no data available yet, save for a brighter day
        this.callback = callback;
      }
    }
  };
});