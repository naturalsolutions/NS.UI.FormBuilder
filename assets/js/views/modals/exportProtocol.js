define(['underscore', 'backbone', 'text!../../../templates/modals/exportProtocolJSON.html', 'bootstrap', 'typeahead', 'fuelux'], function(_, Backbone, exportJSONTemplate) {

    var ExportJSONProtocolModalView = Backbone.View.extend({

        events : {
            'keyup #exportProtocolKeywords'             : 'validateProtocolValue',
            'click #exportProtocolKeywordsList .close'  : 'removeKeyword',
            'click .btn-primary'                        : 'validateProtocolSave'
        },

        initialize : function(options) {
            this.template   = _.template(exportJSONTemplate);
            _.bindAll(this, 'render', 'validateProtocolValue');
            this.keywordList = [];

            // Set URL autocomplete value from options
            this.protocolAutocomplete = options.URLOptions['protocolAutocomplete'];
            this.keywordAutocomplete  = options.URLOptions['keywordAutocomplete'];
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });

            $(this.el).find('#exportProtocolName').typeahead({
                source: _.bind(function(query, process) {
                    return $.getJSON(this.protocolAutocomplete, {query: query}, function(data) {
                        return process(data.options);
                    });
                }, this)
            });

            $(this.el).find('#exportProtocolKeywordsList input[type="text"]').typeahead({
                source: _.bind(function(query, process) {
                    return $.getJSON(this.keywordAutocomplete, {query: query}, function(data) {
                        return process(data.options);
                    });
                }, this),
                updater: _.bind(function(item) {
                    $('#pillbox').pillbox('addItems',-1, [{text :item, value : item}])
                }, this)
            });

            $(this.el).find('#pillbox').pillbox()
            return this;
        },

        validateProtocolValue : function(e) {
            if (e.keyCode === 13) {
                this.appendKeywordValue( $(e.target).val() );
            }
        },

        /**
         * Validate information and send protocol to the repository
         *
         * @param {type} e primary button clicked event
         */
        validateProtocolSave : function (e){

            var exportProtocolName        = $('#exportProtocolName').val()          === "",
                exportProtocolComment     = $('#exportProtocolFileName').val()      === "",
                exportProtocolDescription = $('#exportProtocolDescription').val()   === "",
                myArray = $("#exportProtocolKeywordsList .pill>span:not(.glyphicon)").map(function() {
                 if ($(this).text() !== 'Remove') {
                    return $(this).text();
                 }
                }).get(),
                inputText = $('#exportProtocolKeywordsList input[type="text"]').val(),
                exportProtocolKeywords    = myArray.length  === 0 && inputText == "";


            $('#exportProtocolDescription, #exportProtocolKeywordsList input[type="text"], #exportProtocolFileName, #exportProtocolName').each( function() {
                $(this)[ eval($(this).prop('id')) === true ? 'addClass' : 'removeClass']("error");
            })

            if (!exportProtocolName && !exportProtocolDescription && !exportProtocolKeywords && !exportProtocolComment) {
                myArray.push(inputText);
                this.keywordList = myArray;
                $('#exportmode').val( $(e.target).data('i18n').indexOf('json') > 0 ? 'json' : 'xml');
                $('#exportModal').modal('hide').removeData();
            }
        },

        getData : function() {
            return {
                name        : $('#exportProtocolName').val(),
                comment     : $('#exportProtocolFileName').val(),
                description : $('#exportProtocolDescription').val(),
                keywords    : this.keywordList,
                mode        : $('#exportmode').val()
            }
        }

    });

    return ExportJSONProtocolModalView;

});