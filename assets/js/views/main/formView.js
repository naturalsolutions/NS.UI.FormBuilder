define([
    'jquery',
    'underscore',
    'backbone',
    'text!../../../templates/main/formView.html',
    'i18n',
    'jqueryui',
    'nanoscroller',
    'bootstrap'
], function($, _, Backbone, formViewTemplate) {

    var FormView = Backbone.View.extend({

        events: {
            'change #protocolName' : 'changeFormName'
        },

        initialize: function() {
            this.template = _.template(formViewTemplate);
            _.bindAll(this, 'render',
                            'addElement',
                            'changeFormName',
                            'importXML',
                            'updateView',
                            'getModel',
                            'getXML',
                            "getSubView"
                    );
            this.collection.bind('newElement', this.addElement);
            this._view = [];
        },


        getSubView : function(subViewID) {
            return this._view[subViewID];
        },

        displayNotification : function(type, title, msg) {
            require(['NS.UI.Notification'], function() {
                new NS.UI.Notification({
                    type    : type,
                    title   : title,
                    message : msg
                });
            });
        },

        updateView : function() {
            var renderedContent = this.template(this.collection.toJSON());
            $(this.el).html(renderedContent);
            $(this.el).find('#protocolName').val(this.collection.name);
        },

        addElement: function(newModel) {

            var viewClassName = newModel.constructor.type + "FieldView";

            require(['views/fieldViews/' + viewClassName], _.bind(function(fieldView) {

                //  View file successfully loaded
                var id = "dropField" + this.collection.length;

                $('.drop').append('<div class="span12 dropField " id="' + id  + '" ></div>');

                var vue = new fieldView({
                    el      : '#' + id,
                    model   : newModel,
                    collection : this.collection
               });
                if (vue !== null) {
                    vue.render();
                    this._view[id] = vue;
                }

                $(".actions").i18n();

            }, this), function(err) {
                new NS.UI.Notification({
                    type    : 'error',
                    title   : 'An error occured :',
                    message : "Can't create view for this field"
                });
            });
        },

        render: function() {
            var renderedContent = this.template(this.collection.toJSON());
            $(this.el).html(renderedContent);
            var _vues = this._view;
            $(".drop").sortable({
                cancel      : null,
                cursor      : 'pointer',
                axis        : 'y',
                items       : ".dropField",
                handle      : '.fa-arrows',
                hoverClass : 'hovered',
                containement: '.dropArea',
                stop: function(event, ui) {
                    for (var v in _vues) {
                        _vues[v].updateIndex($('#' + v).index());
                    }
                }
            });
            return this;
        },

        getModel : function() {
            return this.collection.length;
        },

        changeFormName: function() {
            this.collection.name = $('#protocolName').val();
        },

        getXML : function() {
            return this.collection.getXML();
        },

        getJSON : function() {
            return this.collection.getJSON();
        },

        importXML: function() {
            require(['text!../templates/modals.html', 'app/formbuilder'], _.bind(function(modalViewTemplate, formbuilderRef) {
                var modalTemplate = $(modalViewTemplate).filter('#importProtocolModal')

                $( $(modalTemplate) ).modal({

                }).on('click', '#importProtocolFileText, #importProtocolFind', function() {

                    $('#importProtocolFile').trigger ('click');

                }).on('change', '#importProtocolFile', function() {

                    $('#importProtocolFileText').val( $('#importProtocolFile').val() );

                }).on('click', '.btn-primary', _.bind(function() {

                    $('#importProtocolFileText')[ $('#importProtocolFile').val() === "" ? 'addClass' : 'removeClass']('error');

                    $('#importProtocolName')[ $('#importProtocolName').val() === "" ? 'addClass' : 'removeClass']('error');

                    if (!$('#importProtocolFile').hasClass('error') && !$('#importProtocolName').hasClass('error')) {
                        var file = $('#importProtocolFile')[0].files[0];

                        if (file) {
                            if (file.type === "text/xml") {

                                var reader = new FileReader();
                                reader.readAsText(file, "UTF-8");

                                reader.onload = _.bind(function(evt) {
                                    try {
                                        var result = app.views.XMLValidation(evt.target.result);
                                        if (result !== true) {
                                            $('#importProtocolModal').modal('hide').removeData();
                                            this.displayNotification('error', 'An error occured :', 'There is a error on the ' + result['element'] + '<br />' + result['message'] + '<br />Please check your XML file');
                                        } else {
                                            this.collection.updateWithXml(evt.target.result, $('#importProtocolName').val());
                                            $('#importProtocolModal').modal('hide').removeData();
                                            this.displayNotification('success', 'Porotocol imported :','Your protocol was correctly imported')
                                        }
                                    } catch (err) {
                                        $('#importProtocolModal').modal('hide').removeData();
                                        this.displayNotification('error', 'An error occured :', "Your XML File can't be validated.<br />The specific error is : " + err);
                                    }
                                }, this);

                                reader.onerror = _.bind(function(evt) {
                                    $('#importProtocolModal').modal('hide').removeData();
                                    this.displayNotification('error', 'An error occured :', "An error was occure during reading file");
                                }, this);

                            } else {
                                $('#importProtocolModal').modal('hide').removeData();
                                this.displayNotification('error', 'File type error :', "Your have to give an XML file.");
                            }
                        } else {
                            $('#importProtocolModal').modal('hide').removeData();
                            this.displayNotification('error', 'File type error :', "An error was occure during reading file.");
                        }
                    }

                }, this)).find('#importProtocolName').typeahead({
                    source: function(query, process) {
                        return $.getJSON(formbuilderRef.URLOptions.protocolAutocomplete, {query : query}, function(data) {
                            return process(data.options);
                        });
                    }
                });

            }, this));
        },

        importJSON : function()  {
            require(['text!../templates/modals.html', 'app/formbuilder'], _.bind(function(modalViewTemplate, formbuilderRef) {
                var modalTemplate = $(modalViewTemplate).filter('#importProtocolModal')

                $( $(modalTemplate) ).modal({

                }).on('click', '#importProtocolFileText, #importProtocolFind', function() {

                    $('#importProtocolFile').trigger ('click');

                }).on('change', '#importProtocolFile', function() {

                    $('#importProtocolFileText').val( $('#importProtocolFile').val() );

                }).on('click', '.btn-primary', _.bind(function() {

                    $('#importProtocolFileText')[ $('#importProtocolFile').val() === "" ? 'addClass' : 'removeClass']('error');

                    $('#importProtocolName')[ $('#importProtocolName').val() === "" ? 'addClass' : 'removeClass']('error');

                    if (!$('#importProtocolFile').hasClass('error') && !$('#importProtocolName').hasClass('error')) {
                        var file = $('#importProtocolFile')[0].files[0];

                        if (file) {

                            if (file.name.indexOf('json', file.name.length - 4) !== -1) {

                                var reader = new FileReader();
                                reader.readAsText(file, "UTF-8");

                                reader.onload = _.bind(function(evt) {
                                    //try {
                                        var obj = jQuery.parseJSON(evt.target.result);
                                        this.collection.updateWithJSON(obj, $('#importProtocolName').val());
                                        $('#importProtocolModal').modal('hide').removeData();
                                    /*} catch (e) {
                                        $('#importProtocolModal').modal('hide').removeData();
                                        this.displayNotification('error', 'File type error :', "JSON datas are incorrect");
                                    }*/
                                }, this);

                                reader.onerror = _.bind(function(evt) {
                                    $('#importProtocolModal').modal('hide').removeData();
                                    this.displayNotification('error', 'An error occured :', "An error was occured during reading file");
                                }, this);

                            } else {
                                $('#importProtocolModal').modal('hide').removeData();
                                this.displayNotification('error', 'File type error :', "Your have to give an JSON file.");
                            }
                        } else {
                            $('#importProtocolModal').modal('hide').removeData();
                            this.displayNotification('error', 'File type error :', "An error was occure during reading file.");
                        }
                    }

                }, this)).find('#importProtocolName').typeahead({
                    source: function(query, process) {
                        return $.getJSON(formbuilderRef.URLOptions.protocolAutocomplete, {query : query}, function(data) {
                            return process(data.options);
                        });
                    }
                });

            }, this));
        }
    });

return FormView;

});