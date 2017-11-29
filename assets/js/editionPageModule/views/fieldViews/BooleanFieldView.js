define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView'
], function($, _, Backbone, BaseView) {

    var BooleanFieldView = BaseView.extend({
        events: function() {
            return _.extend(BaseView.prototype.events, {
                'change input[type="checkbox"]' : 'updateSelected'
            });
        },

        updateSelected : function(e) {
            this.model.set('checked', $(e.target).is(':checked'))
        }
    });

    return BooleanFieldView;

});