define(['underscore', 'backbone', 'text!../../../templates/modals/exportProtocolXML.html', 'NS.UI.Notification'], function(_, Backbone, exportProtocolTemplate) {

    var ExportProtocolModalView = Backbone.View.extend({

        events : {
            'keyup #exportProtocolKeywords'             : 'validateProtocolValue',
            'click #exportProtocolKeywordsList .close'  : 'removeKeyword',
            'click .btn-primary'                        : 'validateProtocolSave'
        },

        initialize : function(options) {
            this.template   = _.template(exportProtocolTemplate);
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
                $(this.el).find('#exportProtocolKeywordsList').append(
                    '<li data-value="' + keywordValue + '" >' + keywordValue + '<button class="close">x</button></li>'
                );
                this.keywordList.push(keywordValue);
                $('#exportProtocolKeywords').val("");
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

            var exportProtocolName        = $('#exportProtocolName').val()          === "",
                exportProtocolComment     = $('#exportProtocolFileName').val()      === "",
                exportProtocolDescription = $('#exportProtocolDescription').val()   === "",
                exportProtocolKeywords    = $('#exportProtocolKeywordsList').children('li').length  === 0;


            $('#exportProtocolDescription, #exportProtocolKeywords, #exportProtocolFileName, #exportProtocolName').each( function() {
                $(this)[ eval($(this).prop('id')) === true ? 'addClass' : 'removeClass']("error");
            })

            if (!exportProtocolName && !exportProtocolDescription && !exportProtocolKeywords && !exportProtocolComment) {

                this.model['description'] = $('#exportProtocolDescription').val();
                this.model['keywords'] = this.keywordList;
                this.model['name'] = $('#exportProtocolName').val();

                //  Try to create file
                try {
                        var isFileSaverSupported = !!new Blob();
                        var blob = new Blob(
                                [this.model.getXML()],
                                {type: "application/xml;charset=utf-8"}
                        );
                        saveAs(blob, $('#exportProtocolFileName').val() + '.xml');
                        $('#exportModal').modal('hide').removeData();
                        new NS.UI.Notification({
                            type    : 'success',
                            title   : 'Protocol export :',
                            message : "XML file correctly created"
                        });
                    } catch (e) {
                        console.log (e);
                        $('#exportModal').modal('hide').removeData();
                        new NS.UI.Notification({
                            type    : 'error',
                            title   : 'An error occured :',
                            message : "Can't create your JSON file"
                        });
                    }
            }
        }

    };

    return ExportProtocolModalView;

});