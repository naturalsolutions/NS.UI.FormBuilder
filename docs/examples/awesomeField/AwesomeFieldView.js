/**
 * This file is an example view for awesome field type
 * Put this file on view/fields forlder to add it on the application
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/AwesomeFieldView.html'
], function($, _, Backbone, BaseView, viewTemplate) {

    var AwesomeFieldView = BaseView.extend({

        initialize : function(options) {
            var opt = options;
            opt.template = viewTemplate;
            BaseView.prototype.initialize.apply(this, [opt]);
        },

        render : function() {
           BaseView.prototype.render.apply(this, arguments);
       }

    });

    return AwesomeFieldView;

});