/**
 * @fileOverview modal.js
 *
 * Describe all modal views for bootstrap
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(['backbone'], function(Backbone) {

    var modalViews = {};

    modalViews.SaveProtocolModalView = Backbone.View.extend({

        events : {
            'keyup #saveProtocolKeywords'               : 'validateProtocolValue',
            'click #saveProtocolKeywordsList .close'    : 'removeKeyword',
            'click .btn-primary'                        : 'validateProtocolSave'
        },

        initialize : function(options) {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'validateProtocolValue', 'removeKeyword', 'appendKeywordValue');
            this.keywordList = [];
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });

            //  Add autocomplete control on protocol name and keyword input

            $(this.el).find('#saveProtocolName').typeahead({
                source: function(query, process) {
                    return $.getJSON(app.instances.protocolAutocomplete, {query: query}, function(data) {
                        return process(data.options);
                    });
                }
            });

            $(this.el).find('#saveProtocolKeywords').typeahead({
                source: function(query, process) {
                    return $.getJSON(app.instances.keywordAutocomplete, {query: query}, function(data) {
                        return process(data.options);
                    });
                },
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
                saveProtocolKeywords    = $('#saveProtocolKeywords').val()      === "",
                saveProtocolComment     = $('#saveProtocolComment').val()       === "";

            $('#saveProto, #saveProtocolDescription, #saveProtocolKeywords, #saveProtocolComment, #saveProtocolName').each( function() {
                $(this)[ eval($(this).prop('id')) === true ? 'addClass' : 'removeClass']("error");
            });

            if (!saveProtocolName && !saveProtocolDescription && !saveProtocolKeywords && !saveProtocolComment) {
                var dataS = JSON.stringify({
                    content: mainView.getFormXML(),
                    name: $('#saveProtocolName').val(),
                    comment: $('#saveProtocolComment').val(),
                    keywords: $('#saveProtocolKeywords').val(),
                    description: $('#saveProtocolDescription').val()
                }, null, 2);

                $.ajax({
                    data: dataS,
                    type: 'POST',
                    url: '/protocols',
                    contentType: 'application/json',
                    success: function(res) {
                        $('#saveModal').modal('hide').removeData();
                        new NS.UI.Notification({
                            type: 'success',
                            title: 'Protocol saved : ',
                            message: 'your protocol has been saved correctly !'
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        $('#saveModal').modal('hide').removeData();
                        new NS.UI.Notification({
                            delay: 15,
                            type: 'error',
                            message: jqXHR.responseText,
                            title: 'An error occured :'
                        });
                    }
                });
            }
        }

    }, {
        templateSrc :   '<div>'+
                        '   <div class="modal-header">' +
                        '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                        '       <h3>Save protocol</h3>'+
                        '   </div>'+
                        '   <div class="modal-body">'+
                        '       <div class="row-fluid">'+
                        '           <label>Protocol name</label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <input type="text" id="saveProtocolName" class="span10" placeholder="Protocol name" data-provide="typeahead" />'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <label>Your comment</label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <input type="text" id="saveProtocolComment" class="span10" placeholder="Your comment" />'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <label>Protocol description</label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <textarea id="saveProtocolDescription" class="span10" placeholder="Describe this protocol in some words"></textarea>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <label>Keywords <i>(Taped enter for validate)</i></label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <input type="text" id="saveProtocolKeywords" placeholder="Enter keywords" class="span10" data-provider="typeahead" />'+
                        "       </div>"+
                        '       <ul class="row-fluid" id="saveProtocolKeywordsList">'+
                        '       </ul>'+
                        '       <div class="row-fluid">&nbsp;</div>'+
                        '   </div>'+
                        '   <div class="modal-footer">'+
                        '       <a href="#" class="btn btn-primary">Save changes</a>'+
                        '   </div>'+
                        '</div>'
    });

    modalViews.ExportProtocolModalView = Backbone.View.extend({

        events : {
            'keyup #exportProtocolKeywords'             : 'validateProtocolValue',
            'click #exportProtocolKeywordsList .close'  : 'removeKeyword',
            'click .btn-primary'                        : 'validateProtocolSave'
        },

        initialize : function(options) {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'validateProtocolValue', 'removeKeyword', 'appendKeywordValue');
            this.keywordList = [];
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });

            //  Add autocomplete control on protocol name and keyword input

            $(this.el).find('#exportProtocolName').typeahead({
                source: _.bind(function(query, process) {
                    return $.getJSON(app.instances.protocolAutocomplete, {query: query}, function(data) {
                        return process(data.options);
                    });
                }, this)
            });

            $(this.el).find('#exportProtocolKeywords').typeahead({
                source: _.bind(function(query, process) {
                    return $.getJSON(app.instances.keywordAutocomplete, {query: query}, function(data) {
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

    }, {
        templateSrc :   '<div>'+
                        '   <div class="modal-header">' +
                        '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                        '       <h3>Export protocol</h3>'+
                        '   </div>'+
                        '   <div class="modal-body">'+
                        '       <div class="row-fluid">'+
                        '           <label>Protocol name</label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <input type="text" id="exportProtocolName" class="span10" placeholder="Protocol name" data-provide="typeahead" />'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <label>Protocol description</label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <textarea id="exportProtocolDescription" class="span10" placeholder="Describe this protocol in some words"></textarea>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <label>Keywords <i>(Taped enter for validate)</i></label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <input type="text" id="exportProtocolKeywords" placeholder="Enter keywords" class="span10" data-provider="typeahead" />'+
                        "       </div>"+
                        '       <ul class="row-fluid" id="exportProtocolKeywordsList">'+
                        '       </ul>'+
                        '       <div class="row-fluid">'+
                        '           <label>XML file name</label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <input type="text" id="exportProtocolFileName" class="span10" placeholder="Your comment" />'+
                        '       </div>'+
                        '   </div>'+
                        '   <div class="modal-footer">'+
                        '       <a href="#" class="btn btn-primary">Export protocol</a>'+
                        '   </div>'+
                        '</div>'
    });

    modalViews.ExportJSONProtocolModalView = Backbone.View.extend({

        events : {
            'keyup #exportProtocolKeywords'             : 'validateProtocolValue',
            'click #exportProtocolKeywordsList .close'  : 'removeKeyword',
            'click .btn-primary'                        : 'validateProtocolSave'
        },

        initialize : function(options) {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'validateProtocolValue', 'removeKeyword', 'appendKeywordValue');
            this.keywordList = [];
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });

            //  Add autocomplete control on protocol name and keyword input

            $(this.el).find('#exportProtocolName').typeahead({
                source: _.bind(function(query, process) {
                    return $.getJSON(app.instances.protocolAutocomplete, {query: query}, function(data) {
                        return process(data.options);
                    });
                }, this)
            });

            $(this.el).find('#exportProtocolKeywords').typeahead({
                source: _.bind(function(query, process) {
                    return $.getJSON(app.instances.keywordAutocomplete, {query: query}, function(data) {
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

                require(['blobjs', 'filesaver'], _.bind(function() {
                    //try {
                        var json = this.model.getJSON();

                        var isFileSaverSupported = !!new Blob();
                        var blob = new Blob( [JSON.stringify(json, null, 2)], {type: "application/json;charset=utf-8"} );
                        saveAs(blob, $('#exportProtocolFileName').val() + '.json');
                        $('#exportModal').modal('hide').removeData();
                        new NS.UI.Notification({
                            type    : 'success',
                            title   : 'Protocol export :',
                            message : "XML file correctly created"
                        });
                    /*} catch (e) {
                        $('#exportModal').modal('hide').removeData();
                        new NS.UI.Notification({
                            type    : 'error',
                            title   : 'An error occured :',
                            message : "Can't create your XML file"
                        });
                    }*/
                }, this))
            }
        }

    }, {
        templateSrc :   '<div>'+
                        '   <div class="modal-header">' +
                        '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                        '       <h3>Export protocol</h3>'+
                        '   </div>'+
                        '   <div class="modal-body">'+
                        '       <div class="row-fluid">'+
                        '           <label>Protocol name</label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <input type="text" id="exportProtocolName" class="span10" placeholder="Protocol name" data-provide="typeahead" />'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <label>Protocol description</label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <textarea id="exportProtocolDescription" class="span10" placeholder="Describe this protocol in some words"></textarea>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <label>Keywords <i>(Taped enter for validate)</i></label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <input type="text" id="exportProtocolKeywords" placeholder="Enter keywords" class="span10" data-provider="typeahead" />'+
                        "       </div>"+
                        '       <ul class="row-fluid" id="exportProtocolKeywordsList">'+
                        '       </ul>'+
                        '       <div class="row-fluid">'+
                        '           <label>JSON file name</label>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <input type="text" id="exportProtocolFileName" class="span10" placeholder="Your comment" />'+
                        '       </div>'+
                        '   </div>'+
                        '   <div class="modal-footer">'+
                        '       <a href="#" class="btn btn-primary">Export protocol</a>'+
                        '   </div>'+
                        '</div>'
    });

    modalViews.DiffProtocolModalView = Backbone.View.extend({

        events : {
            'click .btn-primary'             : 'showDiff',
            'click #findSource, #findUpdate' : 'triggerInputFile',
            'change input[type="file"]'      : 'inputFileValueChange'
        },

        initialize : function (options) {
            this.template   = _.template(this.constructor.templateSrc);
        },

        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });

            return this;
        },

        showDiff: function() {
            $('#compareModal').modal('hide');

            var source  = $('#compareModal').find('#sourceHide')[0].files[0],
                update  = $('#compareModal').find('#updateHide')[0].files[0],
                srcName = source['name'],
                updName = update['name'],
                reader  = null;

            if (source === null || update === null) {
                formBuilder.displayNotification("Reading error", 'error', 'Error durring XML loading ! ');
                return;
            }

            if (source.type !== "text/xml" || update.type !== "text/xml") {
                formBuilder.displayNotification("File mime type error", 'error', 'You must choose only XML files');
                return;
            }

                    reader = new FileReader();
            reader.readAsText(source, "UTF-8");

            reader.onload = function(evt) {
                try {
                    if (formBuilder.XMLValidation(evt.target.result) !== true) {
                        formBuilder.displayNotification(result.error, 'error', 'Your XML don\'t matches with XML Schema');
                        return;
                    }

                    source = evt.target.result;
                    reader = new FileReader();
                    reader.readAsText(update, "UTF-8");

                    reader.onload = function(evt) {

                        if (formBuilder.XMLValidation(evt.target.result) === true) {
                            update = evt.target.result;
                            $('.widgetsPanel').switchClass('span3', 'span0', 250, function() {
                                $('.dropArea').append(formBuilder.GetXMLDiff(source, update, srcName, updName));
                                $('.dropArea').switchClass('span9', 'span12', 250).find('.diff').addClass('span11');
                                var acts = {
                                    quit: new NS.UI.NavBar.Action({
                                        handler: function() {
                                            $('.widgetsPanel').switchClass('span0', 'span3', 250, function() {
                                                $('.dropArea').switchClass('span2', 'span9', 250).find('table').remove();
                                                navbar.setActions(actions);
                                                addIcon();
                                            });
                                        },
                                        allowedRoles: ["reader"],
                                        title: "Quit"
                                    })
                                };
                                navbar.setActions(acts);
                            });
                        }
                    };

                } catch (exp) {
                    new NS.UI.Notification({
                        type: 'error',
                        title: "An error occured",
                        message: 'One of giles can\'t be read'
                    });
                }
            };
            reader.onerror = function(evt) {
                new NS.UI.Notification({
                    type: 'error',
                    title: "Reading error",
                    message: 'An error was occure during reading file'
                });
            };
        },

        inputFileValueChange: function(e) {
            var id      = $(e.target).prop('id').replace('Hide', ''),
                split    = $(this).val().split('\\');
            //  Set input text value from input file value
            $('#' + id).val(split[ split.length - 1]);
        },

        triggerInputFile : function (e) {
            $('#' + $(e.target).prop('id').replace('find', '').toLowerCase() + 'Hide').trigger('click');
        }

    }, {
        templateSrc :   '<div>'+
                        '   <div class="modal-header">'+
                        '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                        '       <h2>XML File versionning</h2>'+
                        '   </div>'+
                        '   <br />'+
                        '   <div class="row-fluid"> '+
                        '       <input type="file" id="sourceHide"  class="hide" /> '+
                        '       <label class="span2 offset1">Source XML</label> '+
                        '       <input type="text" class="span5" id="source" placeholder="Your XML File" /> '+
                        '       <button type="button" class="span3 btn" id="findSource" style="margin-left: 10px;">Find</button> '+
                        '   </div> '+
                        '   <div class="row-fluid"> '+
                        '       <input type="file" id="updateHide"  class="hide" /> '+
                        '       <label class="span2 offset1">Updated XML</label> '+
                        '       <input type="text" class="span5" id="update" placeholder="Your XML File" /> '+
                        '       <button type="button" class="span3 btn" id="findUpdate" style="margin-left: 10px;">Find</button> '+
                        '   </div> '+
                        '   <div class="modal-footer">'+
                        '       <a href="#" class="btn btn-primary">Run versionning</a>'+
                        '   </div>'+
                        '</div>'
    });

    modalViews.EditListModal = Backbone.View.extend({

        events : {
            'click #addItem'                : 'addItem',
            'click .btn-primary'            : 'saveChanges',
            'change input[type="text"]'     : 'propertyChanged',
            'change input[type="radio"]'    : 'defaultValueChanged',
            'click td .close'               : 'removeItem',
            'hidden'                        : 'close'
        },

        initialize : function (){
            this.template = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'saveChanges', 'propertyChanged', 'defaultValueChanged', 'removeItem');
        },

        render: function() {
            var renderedContent = this.template(this.model);
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });
            return this;
        },

        close : function(e) {
            var len = this.model["items"].length, last = this.model["items"][len - 1];

            if (last["en"] === "" || last["fr"] === "" || last["value"] === "") {
                this.model["items"].splice(len - 1, 1);
            }

            this.remove();
            this.unbind();
            $('#compareModal').after('<div class="modal hide fade" id="editListModal"></div>');
        },

        addItem : function(e) {
            var index = this.model['items'].length, check = true;


            if (this.model['items'][index - 1]["en"] === "" ) {
                check &= false;;
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="en"]').addClass('error');
            } else {
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="en"]').removeClass('error');
            }

            if (this.model['items'][index - 1]["fr"] === "" ) {
                check &= false;;
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="fr"]').addClass('error');
            } else {
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="fr"]').removeClass('error');
            }

            if (this.model['items'][index - 1]["value"] === "" ) {
                check &= false;
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="value"]').addClass('error');
            } else {
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="value"]').removeClass('error');
            }

            if (check) {
                this.model['items'].push({
                    en : "", value : "", id : index, fr : ""
                });
                $(e.target).parents('tr').before(
                    '<tr>'+
                    '   <td>'+
                    '       <input type="text" data-attr="en" placeholder="New item label" data-index="' + index + '" />'+
                    '   </td>'+
                    '   <td>'+
                    '       <input type="text" data-attr="fr" placeholder="New item label" data-index="' + index + '" />'+
                    '   </td>'+
                    '   <td>'+
                    '       <input type="text" data-attr="value" placeholder="New item value"  data-index="' + index + '" />'+
                    '   </td>'+
                    '   <td>'+
                    '       <input type="radio"  data-index="' + index + '" name="defaultValue" /> <button type="button" data-index="' + index + '" class="close">&times;</button>'+
                    '   </td>'+
                    '</tr>'
                );
            }

        },

        removeItem : function(e) {
            this.model['items'].splice($(e.target).data('index'), 1);
            $(e.target).parents('tr').remove();
            if (this.model['items'].length === 1) {
                this.model['defaultValue'] = 0;
                $(this.el).find('input[type="radio"]').prop('checked', true);
            }
        },

        saveChanges : function() {

            var end =_.bind(function(options) {
                if (options === true) {
                    $(this.el).modal('hide');
                    this.trigger('saved');
                }
            }, this);

            var checkValues = _.bind(function(callback) {
                var check = true;
                _.each( this.model['items'], function(el, idx) {
                    if (el['en'] === "") {
                        check = false;
                        $(this.el).find('input[type="text"][data-index="' + idx + '"][data-attr="en"]').addClass('error');
                    }
                    if (el['fr'] === "") {
                        check = false;
                        $(this.el).find('input[type="text"][data-index="' + idx + '"][data-attr="fr"]').addClass('error');
                    }
                    if (el['value'] === "") {
                        check = false;
                        $(this.el).find('input[type="text"][data-index="' + idx + '"][data-attr="value"]').addClass('error');
                    }
                });
                callback(check);
            }, this);

            checkValues(end);
        },

        propertyChanged : function(e) {
            if ($(e.target).val() === "") {
                $(e.target).addClass('error');
            } else {
                $(e.target).removeClass('error');
                var itemIndex       = $(e.target).data('index'),
                    itemAttribute   = $(e.target).data('attr'),
                    attributeValue  = $(e.target).val();

                this.model["items"][itemIndex][itemAttribute] = attributeValue;
            }
        },

        defaultValueChanged : function(e) {
            this.model['defaultValue'] = $(e.target).data('index');
        }

    }, {
        templateSrc :   '<div>'+
                        '   <div class="modal-header">' +
                        '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                        '       <h3>Items list</h3>'+
                        '   </div>'+
                        '   <div class="modal-body">'+
                        '       <div class="row-fluid">'+
                        '           <div class="block span12">' +
                        '               <table class=" table table-striped">' +
                        '                   <thead>' +
                        '                       <tr>'+
                        '                           <th>Label en</th>'+
                        '                           <th>Label fr</th>'+
                        '                           <th>Value</th>'+
                        '                           <th>Is the default value ?</th>'+
                        '                       </tr>'+
                        '                   </thead>' +
                        '                   <tbody>' +
                        '                   <% _.each( items, function(item, idx) { %>' +
                        '                       <tr>' +
                        '                           <td><input type="text" data-index="<%= idx %>" data-attr="label" value="<%= item["en"] %>" /></td>'+
                        '                           <td><input type="text" data-index="<%= idx %>" data-attr="label" value="<%= item["fr"] %>" /></td>'+
                        '                           <td><input type="text" data-index="<%= idx %>" data-attr="value" value="<%= item["value"] %>" /></td>' +
                        '                           <td><input type="radio" name="defaultValue" data-index="<%= idx %>" <% if (defaultValue === item["id"]) { %> checked <% } %> /> <% if (idx > 0) { %> <button type="button" data-index="<%= idx %>" class="close">&times;</button> <% } %></td>'+
                        '                       </tr>' +
                        '                   <% }); %>' +
                        '                       <tr><td rowspan="3"><button id="addItem" type="button">Add item</button></td></tr>'   +
                        '                   </tbody>'+
                        '               </table>' +
                        '           </div>'+
                        '       </div>'+
                        '       <div class="row-fluid">' +
                        '           <label class="span10 offset1"></label>' +
                        '       </div>'+
                        '   </div>'+
                        '   <div class="modal-footer">'+
                        '       <button class="btn btn-primary">Save changes</button>'+
                        '   </div>'+
                        '</div>'
    });

    return modalViews;
});