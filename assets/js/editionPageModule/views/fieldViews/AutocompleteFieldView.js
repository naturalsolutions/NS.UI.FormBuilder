define([
    'jquery',
    'underscore',
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
                /*
                console.log("setAutocomplete", that.model.get('triggerlength'));
                console.log("setAutocomplete", data);
                console.log("setAutocomplete", $(that.el));
                console.log("setAutocomplete", $(that.el).find('.form-control'));
                */
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
                console.log(err);
            }

            if (sqlParsed)
            {
                that.model.set('isSQL', true);
            }
            else
            {
                that.model.set('isSQL', false);
                if (!that.autocompleteLoaded)
                {
                    that.autocompleteLoaded = true;
                    try {
                        $.ajax({
                            data: JSON.stringify({'sqlQuery': that.model.get('url'), 'context': window.context}),
                            type: 'POST',
                            url: that.URLOptions.sqlAutocomplete,
                            contentType: 'application/json',
                            crossDomain: true,
                            success: _.bind(function (data) {
                                setAutocomplete(data);
                            }, that),
                            error: _.bind(function (xhr, ajaxOptions, thrownError) {
                                console.log(xhr + " & " + ajaxOptions + " & " + thrownError + " <-------- AJAX ERROR !");
                            }, that)
                        });
                    }
                    catch (err)
                    {
                        console.log(err);
                        $.getJSON(that.model.get('url'), _.bind(function (data) {
                            setAutocomplete(data.options);
                        }, that));
                    }
                }
            }
       }

    });

    return AutocompleteFieldView;
});
