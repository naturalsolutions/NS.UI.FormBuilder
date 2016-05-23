define([
    'jquery',
    'underscore',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/TextFieldView.html',
    'text!editionPageModule/templates/fields/readonly/TextFieldView.html',
    '../../../../../node_modules/sqlite-parser/dist/sqlite-parser'
], function($, _, Backbone, BaseView, viewTemplate, viewTemplateRO, sqliteParser) {

    var TextFieldView = BaseView.extend({

        /**
         * Get BaseView events and add sepecific TextFieldView event
         */
        events: function() {
            return _.extend({}, BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = viewTemplate;
            if (readonly)
                opt.template = viewTemplateRO
            BaseView.prototype.initialize.apply(this, [opt]);
        },

        /**
         * Render view
         */
        render : function() {
            BaseView.prototype.render.apply(this, arguments);

            var sqlParsed = false;

            try
            {
                sqlParsed = sqliteParser(this.model.get('defaultValue'));
            }
            catch (err)
            {
                console.log(err);
            }

            if (sqlParsed)
            {
                this.model.set('isDefaultSQL', true);
            }
            else
            {
                this.model.set('isDefaultSQL', false);
            }
        },

       /**
        * Change model value when text input value changed
        *
        * @param {object} jQuery event
        */
        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }

    });

    return TextFieldView;

});
