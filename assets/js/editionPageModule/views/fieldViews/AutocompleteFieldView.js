define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    'text!editionPageModule/templates/fields/autocompleteView.html',
    'text!editionPageModule/templates/fields/readonly/autocompleteView.html',
    '../../../../../node_modules/sqlite-parser/dist/sqlite-parser',
    'jquery-ui'
], function($, _, Backbone, BaseView, autocompleteTemplate, autocompleteTemplateRO, sqliteParser) {

    var AutocompleteFieldView = BaseView.extend({

        /**
         * Get BaseView events and add sepecific TextFieldView event
         */
        events: function() {
            return _.extend(BaseView.prototype.events, {
                
            });
        },

        initialize : function(options, readonly) {
            var opt = options;
            opt.template = autocompleteTemplate;
            if (readonly)
                opt.template = autocompleteTemplateRO;

            this.URLOptions = options.urlOptions;
            BaseView.prototype.initialize.apply(this, [opt]);
        },

        /**
         * Render view
         */
        render : function() {
            var that = this;

            BaseView.prototype.render.apply(that, arguments);

            var setAutocomplete = function (data) {
                $(that.el).find('.form-control').autocomplete({
                    minLength: that.model.get('triggerlength'),
                    scrollHeight: 220,
                    source: data
                });
            };

            var sqlParsed = false;

            try
            {
                sqlParsed = sqliteParser(that.model.get('url'));
            }
            catch (err)
            {
                console.log("Debug information on sql parsing, might be useful:", err);
            }

            if (sqlParsed && that.model.get('url') != "")
            {
                that.model.set('isSQL', true);

                $.ajax({
                    data: JSON.stringify({'sqlQuery': that.model.get('url'), 'context': window.context}),
                    type: 'POST',
                    url: that.URLOptions.sqlAutocomplete,
                    contentType: 'application/json',
                    crossDomain: true,
                    success: _.bind(function (data) {
                        if (!that.autocompleteLoaded) {
                            setAutocomplete(data);
                            that.autocompleteLoaded = true;
                        }
                    }, that),
                    error: _.bind(function (xhr, ajaxOptions, thrownError) {
                        console.log(xhr + " & " + ajaxOptions + " & " + thrownError + " <-------- AJAX ERROR !");
                    }, that)
                });
            }
            else
            {
                that.model.set('isSQL', false);
                if (!that.autocompleteLoaded)
                {
                    $.getJSON(that.model.get('url'), _.bind(function (data) {
                        setAutocomplete(data.options);
                        that.autocompleteLoaded = true;
                    }, that));
                }
            }
       }

    });

    return AutocompleteFieldView;
});
