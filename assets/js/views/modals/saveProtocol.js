define(['underscore', 'backbone', 'text!../../../templates/modals/saveProtocol.html', 'bootstrap', 'typeahead'], function(_, Backbone, saveProtocolTemplate) {

    var SaveProtocolModalView = Backbone.View.extend({

        events : {
            'keyup #saveProtocolKeywords'               : 'validateProtocolValue',
            'click #saveProtocolKeywordsList .close'    : 'removeKeyword',
            'click .btn-primary'                        : 'validateProtocolSave'
        },

        initialize : function(options) {
            this.template   = _.template(saveProtocolTemplate);
            _.bindAll(this, 'render', 'validateProtocolValue', 'removeKeyword', 'appendKeywordValue');
            this.keywordList = [];

            // Set URL autocomplete value from options
            this.protocolAutocomplete = options.protocolAutocomplete;
            this.keywordAutocomplete  = options.keywordAutocomplete
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });

            $(this.el).find('#saveProtocolName').typeahead({
                source: _.bind(function(query, process) {
                    return $.getJSON(this.protocolAutocomplete, {query: query}, function(data) {
                        return process(data.options);
                    });
                }, this)
            });

            $(this.el).find('#saveProtocolKeywords').typeahead({
                source: _.bind(function(query, process) {
                    return $.getJSON(this.keywordAutocomplete, {query: query}, function(data) {
                        return process(data.options);
                    });
                }, this),
                updater: _.bind(function(item) {
                    this.appendKeywordValue(item);
                }, this)
            });

            return this;
        },

        validateProtocolValue : function(e) {
            if (e.keyCode === 13) {
                this.appendKeywordValue( $(e.target).val() );
            }
        },

        /**
         * Add the keyword value in the list and check if the keyword not exists yet
         *
         * @param {type} keywordValue
         */
        appendKeywordValue : function(keywordValue) {
            if (this.keywordList.indexOf(keywordValue) > -1) {

                $('li[data-value="' + keywordValue + '"]').css('background', 'red');
                setTimeout( function() {
                    $('li[data-value="' + keywordValue + '"]').css('background', '#0ac');
                }, 1500);

            } else {

                $(this.el).find('#saveProtocolKeywordsList').append(
                    '<li data-value="' + keywordValue + '" >' + keywordValue + '<button class="close">x</button></li>'
                );
                this.keywordList.push(keywordValue);
                $('#saveProtocolKeywords').val("");

            }
        },

        /**
         * Remove keyword from the list
         *
         * @param {type} e clicked li on the keyword list
         */
        removeKeyword: function(e) {
            this.keywordList.splice($(e.target).parent('li').index(), 1);
            $(e.target).parent('li').remove();
        },

        /**
         * Validate information and send protocol to the repository
         *
         * @param {type} e primary button clicked event
         */
        validateProtocolSave : function (e){
            var saveProtocolName        = $('#saveProtocolName').val()          === "",
                saveProtocolDescription = $('#saveProtocolDescription').val()   === "",
                saveProtocolKeywords    = $('#saveProtocolKeywordsList').children('li').length  === 0,
                saveProtocolComment     = $('#saveProtocolComment').val()       === "";

            $('#saveProto, #saveProtocolDescription, #saveProtocolKeywords, #saveProtocolComment, #saveProtocolName').each( function() {
                $(this)[ eval($(this).prop('id')) === true ? 'addClass' : 'removeClass']("error");
            });

            if (!saveProtocolName && !saveProtocolDescription && !saveProtocolKeywords && !saveProtocolComment) {
                $('#saveModal').modal('hide').removeData();
            }
        },

        getData : function() {
            return JSON.stringify({
                name        : $('#saveProtocolName').val(),
                comment     : $('#saveProtocolComment').val(),
                keywords    : $('#saveProtocolKeywords').val(),
                description : $('#saveProtocolDescription').val()
            }, null, 2);
        }

    });

    return SaveProtocolModalView;

});