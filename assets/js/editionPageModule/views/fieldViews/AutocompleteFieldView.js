define([
    'jquery',
    'lodash',
    'backbone',
    'editionPageModule/views/fieldViews/BaseView',
    '../../../../../node_modules/sqlite-parser/dist/sqlite-parser',
    'jquery-ui'
], function($, _, Backbone, BaseView, sqliteParser) {

    var AutocompleteFieldView = BaseView.extend({
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
