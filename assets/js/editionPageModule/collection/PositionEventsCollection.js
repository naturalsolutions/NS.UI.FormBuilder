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
    schemaExtention: {

    },

    propertiesDefaultValues : {

    },

    getExtractedDatas: function() {
      return {};
    },
    getSchemaExtention: function(){
      return this.schemaExtention;
    },
    initializeExtention: function () {
      return true;
    },

    jsonExtention: function (originalForm) {
      return(this.propertiesDefaultValues);
    },
    updateAttributesExtention: function () {
      return true;
    }
  };
});