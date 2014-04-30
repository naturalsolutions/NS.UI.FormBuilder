/**
 * @fileOverview view.js
 * This file implements all field and specific views
 *
 * Depandencies :   undersoore
 *                  jquery
 *                  backbone
 *                  jqueryui
 *                  model.js
 *                  collection.js
 *
 * Each views (exept settings views : Settingview) has a class property "templateSrc".
 * That property contains the view HTML code for backbone templating render.
 *
 * Some views uses jquery ui to add some effect and for a better interface.
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

var formBuilder = (function(formBuild) {
    
    /**
     * It's the basic views for all field view.
     */
    formBuild.BaseView = Backbone.View.extend({
        events: {
            'click  .fa-trash-o' : 'removeView',
            'click .fa-wrench'   : 'setting',
            'focus input'        : 'updateSetting'
        },
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'removeView', 'setting', 'updateSetting', 'getHtml', 'deleteView');
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.deleteView);
        },
        updateIndex: function(idx) {
            this.model.id = parseInt(idx);
        },
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        },
        getHtml : function() {
            return this.html(this.model.toJSON());
        },
        deleteView : function() {
            $(this.el).remove();
            this.remove();
        },
        removeView: function() {
            //this.model.collection.remove(this.model);
            //this.model.trigger('destroy');
            this.model.set('state', 'delete');
            $(this.el).remove();
            this.remove();
        },
        updateSetting : function() {
            if (!$('.dropArea').hasClass('span9')) {
                formBuild.set = new formBuild.SettingView({
                    model: this.model,
                    el: $('.settings')
                }).render();
            }
        },
        setting: function() {
            if ($('.dropArea').hasClass('span9')) {
                formBuild.settingsView.changeModel(this.model);
            }
        }
    });
    
    /**
     * View for text field element
     * Herited from base view
     */
    formBuild.TextFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },
        render : function() {
           formBuild.BaseView.prototype.render.apply(this, arguments);
           $(this.el).find('input[type="text"]').enableSelection();
       },
        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required === true) { %> required <% } %>"><%= label %></label> '+
                        '<input type="text" class="span8" name="<%= name %>" readonly="<%= readOnly %>"  id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    /**
     * View for pattern field
     */
    formBuild.PatternFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },
        initialize : function() {
          formBuild.BaseView.prototype.initialize.apply(this, arguments);
        },
        render : function() {
           formBuild.BaseView.prototype.render.apply(this, arguments);
           $(this.el).find('input[type="text"]').enableSelection();
       },
        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required === true) { %> required <% } %>"><%= label %></label> '+
                        '<input type="text" class="span8" name="<%= name["displayLabel"] %>" readonly="<%= readOnly %>"  id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" pattern="<%= pattern %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });
    
    /**
     * file field view
     */
    formBuild.FileFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },
        initialize : function() {
          formBuild.BaseView.prototype.initialize.apply(this, arguments);
        },
        render : function() {
           formBuild.BaseView.prototype.render.apply(this, arguments);
           $(this.el).find('input[type="text"]').enableSelection();
       },
        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required === true) { %> required <% } %>"><%= label %></label> '+
                        '<input type="file" class="span8" name="<%= name["displayLabel"] %>"  id="<%= id%>" value="<%= defaultValue %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });
    
    /**
     * NumericFieldView
     */
    formBuild.NumericFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
            });
        },
        render: function() {
            formBuild.BaseView.prototype.render.apply(this, arguments);
            $(this.el).find('input').spinner({
                step: this.model.step,
                min : this.model.minValue
            }).parent('span').addClass('span8')
        }
    }, {
        templateSrc :   '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label> '+
                        '<input class="span12 spin" name="<%= name %>" step="<%= step %>" id="<%= id%>" placeholder="<%= hint %>" min="<%= minValue %>" max="<%= maxValue %>" value="<% defaultValue || 0 %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    /**
     * Radio field view
     */
    formBuild.RadioFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'click input[type="radio"]'        : 'updateSetting'
            });
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label>'+
                        '<div class="span8" style="border : 2px #eee solid;" id="<%= id %>">'+
                            '<% _.each(option, function(el, index) { %>' +
                                '<label class="span12 noMarginLeft left"> '+
                                    '<input type="radio" style="margin-left: 10px;" name="<%= name %>" value="<%= el.value%>" <% if (defaultValue == index) {%> checked <% } %> /> '+
                                    '<%= el.label %>'+
                                '</label> '+
                            '<% }); %>'+
                        '</div>'+
                        '<div class="span1 .pull-right"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    /**
     * Options field vue
     */
    formBuild.SelectFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change select'        : 'updateSelected'
            });
        },
        updateSelected : function(e) {
            this.model.updateSelectedOption($(e.target).find(':selected').data('idx'), true);
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label> '+
                        '<select name="<% name %>" class="span8"> '+
                            '<% _.each(option, function(el, idx) { %>' +
                                '<option data-idx=<%= idx %> value="<%= el.value %>" <% if (defaultValue == idx) {%> selected <% } %> ><%= el.label %></option>'+
                            '<% }) %>' +
                        '</select> '+
                        '<div class="span1 .pull-right"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div> '
    });

    /**
     * Checkbox field view
     */
    formBuild.CheckBoxFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change input[type="checkbox"]' : 'updateSelected'
            });
        },
        updateSelected : function(e) {
            this.model.updateSelectedOption($(e.target).data('idx'), $(e.target).is(':checked'));
        },
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label>'+
                        '<div class="span8" style="border : 2px #eee solid;">'+
                            '<% _.each(option, function(el, idx) { %>' +
                                '<label class="span12 noMarginLeft left"> '+
                                    '<input data-idx=<%= idx %> type="checkbox" style="margin-left: 10px;" name="<%= name %>" id="<%= id %>" value="<%= el.value%>" <% if (defaultValue == idx) {%> checked <% } %> /> '+
                                    '<%= el.label %>'+
                                '</label> '+
                            '<% }); %>'+
                        '</div>'+
                        '<div class="span1 .pull-right"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    /**
     * Long text view
     */
    formBuild.LongTextFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'focus textarea'        : 'updateSetting'
            });
        },
        initialize : function() {
            formBuild.BaseView.prototype.initialize.apply(this, arguments);
            $(this.el).addClass('textArea');
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>" ><%= label %></label>'+
                        '<textarea class="span8" style="<% if(!resizable){ %>resize: none<%}%>" class="span8"  name="<%= name %>" id="<%= id%>" placeholder="<%= hint %>"><%= defaultValue %></textarea>'+
                        '<div class="span1"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div> '
    });
    
    /**
     * Tree view field view
     */
    formBuild.TreeViewFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
            });
        },
        render : function() {
            formBuild.BaseView.prototype.render.apply(this, arguments);
            var src = this.model.get('node');
            $(this.el).find('#tree').fancytree({
                source: src,
                checkbox : true,
                selectMode : 2
            });
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>" ><%= label %></label>'+
                        '<div class="span8" id="tree"></div>' + 
                        '<div class="span1"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div> '
    });

    /**
     * date field view
     */
    formBuild.DateFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
            });
        },
       render : function() {
           formBuild.BaseView.prototype.render.apply(this, arguments);
           $(this.el).find('input').datepicker({
               format: this.model.get('format')
           });
       }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label> '+
                        '<input type="text" class="span8" name="<%= name %>" id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    /**
     * Main form view
     */
    formBuild.FormView = Backbone.View.extend({
        events: {
            'change #protocolName' : 'changeFormName'
        },
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'addElement', 'changeFormName', 'importXML', 'downloadXML', 'updateView');
            this.collection.bind('add', this.addElement);
            this.collection.bind('change', this.updateView);
            this._view = [];
        },
        
        updateView : function() {
          $(this.el).find('#protocolName').val(this.collection.name);
        },
        
        addElement: function(el) {
            
            var id = "dropField" + this.collection.length;
        
            $('.drop').append('<div class="span12 dropField " id="' + id  + '" ></div>');            
            
            if (formBuild[el.constructor.type + "FieldView"] !== undefined) {
                var vue = new formBuild[el.constructor.type + "FieldView"]({
                    el      : $("#" + id),
                    model   : el
                });

                if (vue !== null) {
                    vue.render();
                    this._view[id] = vue;
                }
            } else {
                formBuilder.displayError("Error", "Can't create view for this field");
            }
            
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
                connectWith : ".sortable",
                handle      : 'label, input[type="text"]',
                containement: '.dropArea',
                stop: function(event, ui) {
                    for (var v in _vues) {
                        _vues[v].updateIndex($('#' + v).index());
                    }
                }
            }).disableSelection();
            return this;
        },
        changeFormName: function() {
            this.collection.name = $('#protocolName').val();
        },
        downloadXML: function() {
            var str = '<div id="popup">' + this.constructor.popupDwSrc + '</div>';
            var coll = this;
            $(str).dialog({
                modal       : true,
                width       : 700,
                resizable   : false,
                draggable   : false,
                position    : 'center',
                create: function() {
                    var parent = $(this);
                    $(this).find('button').bind('click',function() {
                        if ($(parent).find('input[type="text"]').val() !== "") {
                            try {
                                var isFileSaverSupported = !!new Blob();
                                var blob = new Blob(
                                        [coll.collection.getXML()],
                                        {type: "application/xml;charset=utf-8"}
                                );
                                saveAs(blob, $(parent).find('input[type="text"]').val() + '.xml');
                                $(parent).dialog('close');
                            } catch (e) {
                                console.log (e)
                                formBuild.displayError("Error", "Can't create file");
                            }
                        } else {
                            formBuild.displayError("Error", "You need to enter a name for your file");
                        }
                    });
                }
            });
        },
        importXML: function() {
            var str = '<div id="popup">' + this.constructor.popupSrc + '</div>';
            var coll = this;
            $(str).dialog({
                modal       : true,
                width       : 700,
                resizable   : false,
                draggable   : false,
                position    : 'center',
                create : function() {
                    var parent = $(this);
                    $(this).find('input[type="file"]').bind("change", function() {
                        var split = $(this).val().split('\\');
                        $(parent).find('#fileToImport').val( split[ split.length - 1] );
                    });
                    $(this).find('#findButton').bind('click', function() {
                        $(parent).find('#fileToImportHide').trigger('click');
                    });
                    $(this).find('#fileToImport').bind('click', function() {
                        $(parent).find('#fileToImportHide').trigger('click');
                    });
                    $(this).find('#importButton').bind('click', function() {
                        $(parent).dialog('close');
                        var file = $(parent).find('#fileToImportHide')[0].files[0];

                        if (file) {
                            if (file.type === "text/xml") {
                                var reader = new FileReader();
                                reader.readAsText(file, "UTF-8");
                                reader.onload = function(evt) {
                                    try {
                                        
                                        var result = formBuild.XMLValidation(evt.target.result);
                                        if (result !== true) {
                                            var str = 'There is a error on the ' + result['element'] + '<br />';
                                            str += result['message'] + '<br />Please check your XML file';
                                            formBuild.displayError(result['error'], str);
                                        } else {
                                            coll.collection.updateWithXml(evt.target.result);
                                        }
                                    } catch (err) {
                                        var str = "Your XML File can't be validated.<br />The specific error is : " + err;
                                        formBuild.displayError('Error during XML validation', str);
                                    }
                                };
                                reader.onerror = function(evt) {
                                    formBuild.displayError("An error was occured", 'An error was occure during reading file');
                                };
                            } else {
                                formBuild.displayError("File type error", 'Your have to give an XML file.');
                            }
                        } else {
                            formBuild.displayError("An error was occured", 'An error was occure during reading file');
                        }
                    });
                }
            });
        }
    }, {
        templateSrc:    '<div class="row-fluid">'+
                            '<input type="text" id="protocolName" name="protocolName" value="<%= this.collection.name %>" />'+
                            '<hr class="mainHr"/><br />' +
                        '</div>'+
                        '<div class="row-fluid">'+
                            '<div class="span10 offset1 drop"></div>'+
                        '</div>',

        popupSrc:   '<div id="popup" class="row-fluid">'+
                        '<h2 class="offset1">Your XML will be validate after import</h2><br />'+
                        '<div class="row-fluid">'+
                            '<input type="file" id="fileToImportHide"  class="hide" />'+
                            '<label class="span2 offset1">XML file</label>'+
                            '<input type="text" class="span5" id="fileToImport" placeholder="Your XML File" />'+
                            '<button type="button" class="span3" id="findButton" style="margin-left: 10px;">Find</button>'+
                        '</div>'+
                        '<div class="row-fluid">'+
                            '<br />'+
                            '<button class="span4 offset3" id="importButton">Import</button>'+
                        '</div>'+
                    '</div>',

        popupDwSrc: '<div id="popupDownload" class="row-fluid">'+
                        '<div class="row-fluid">'+
                            '<h2 class="offset1 span10 center">Now you can download your XML File</h2>'+
                        '</div>'+
                        '<br />'+
                        '<div class="row-fluid">'+
                            '<label class="span4 offset1 right" style="line-height: 30px;">XML file name</label>'+
                            '<input type="text" class="span5" id="fileName" placeholder="Your XML filename" />'+
                        '</div>'+
                        '<br />'+
                        '<div class="row-fluid">'+
                            '<button type="button" class="span10 offset1" id="downloadButton">Dowload</button>'+
                        '</div>'+
                        '<br />'+
                    '</div>'
    });

    /**
     * Settings field view
     */
    formBuild.SettingView = Backbone.View.extend({
        
        events: {
            'click .close'          : 'hidePannel',
            'change .property'      : 'updateModel',
            'click .addOption'      : "addOption",
            'click h2 > a'          : 'displayOptions',
            /*'click .saveOp'         : 'saveOption',
            'click .cancelOp'       : 'cancelOption',
            'click .removeOp'       : 'removeOption',
            'click .editOp'         : 'editOption',
            'click .saveChangeOp'   : 'saveChangeOption',
            'click .cancelChangeOp' : 'cancelChangeOption',*/
            'click #accordion h1'   : 'accordion',
            
            'click .edit' : 'editOption',
            'click .remove' : 'removeOption'
        },
        
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 
                            'hidePannel', 
                            'removePanel', 
                            'changeModel', 
                            'addOption', 
                            'getSubTemplateForArray', 
                            'getSubTemplateForObject'
                        );
            this.model = null;
            this._op = true;
        },
        
        /**
         * Display advanced model field
         */
        displayOptions: function(e) {
            if (!$(e.target).hasClass('selected')) {
                $(".settings h2 > a").toggleClass('selected');
                if ($(e.target).prop('id') === "simple") {
                    $('.advanced').addClass('hide', 500);
                } else {
                    $('.advanced').removeClass('hide', 500);
                }
            }
        },
            
        /**
         * Change the view's model
         * @param {type} model new model
         */
        changeModel : function(model) {
            if (! this.model === null) {
                this.model.off( null, null, this );
                this.model = null;
            }
            this.model = model;
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.removePanel);

            $('.dropArea').switchClass('span9', 'span7', 100);
            $('.widgetsPanel').toggle(100);
            this.render();
        },
        
        removePanel: function() {
          this.hidePannel();
        },
        
        /**
         * Render the view in HTML
         */
        render: function() {
            if (this.model !== null) {
                var renderedContent = this.template(this.model.toJSON());
                $(this.el).html(renderedContent);
                if (this._op) {
                    $('#optionsPanel').addClass('toggle');
                } else {
                    $('#settingsPanel').addClass('toggle');
                }
                return this;
            }
        },
        
        /**
         * Hide the panel using jquery ui effect
         */
        hidePannel : function() {
            if ($('.dropArea').hasClass('span7')) {
                $('.dropArea').switchClass('span7', 'span9', 100);
                $('.widgetsPanel').toggle(100);
                this._op = true;
            }
        },
        
        /**
         * Update model property when input value has changed
         */
        updateModel: function(e) {
            if ($(e.target).prop("type") === "checkbox") {
                this.model.changePropertyValue($(e.target).data('attr'), $(e.target).is(':checked'));
            } else {
                this.model.changePropertyValue($(e.target).data('attr'), $(e.target).val());
            }
            this.model.set('state', 'change');
        },
        
        /**
         * Run graphic effects when accordion event is send by the view
         */
        accordion: function(e) {
            $(e.target).next('div').siblings('div').slideUp();
            $(e.target).next('div').slideToggle();
        },
        
        /**
         * Remove option for an array field in the model (like "options" field)
         */
        removeOption: function(e) {
            if (confirm("Are you sur ?")) {
                this._op = false;
                this.model.removeOption( $(e.target).parents('tr').prop("id") );
            }
        },
        
        
        addOption : function(e) {
            
            var html =  '<div id="myModal" class="modal span8 offset2 fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' + 
                        '   <div class="modal-header">'+
                        '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'+
                        '       <h3 id="myModalLabel">Add an option</h3>'+
                        '   </div>'+
                        '   <div class="modal-body">';
                _.each(this.model.constructor.schema['options']['values'], function(element, index) {
                    html +=     '<div class="row-fluid">'+
                                '   <input type="text" class="span8 offset2 object" data-index="'+index+'" placeholder="' + index + '"' + ' />'+
                                '</div><br />';
                });
                html += '       <div class="row-fluid"><label class="span3 offset2">Is the default value ? </label><input type="checkbox" /></div>'+
                        '   </div>'+
                        '   <div class="modal-footer">'+
                        '       <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>'+
                        '       <button class="btn btn-primary saveChange">Save changes</button>'+
                        '   </div>'+
                        '</div>';
                
            var popup = $(html);
            $(popup).modal();
            $(popup).find('.saveChange').bind('click', _.bind(function(e) {
                var newOption = {};
                
                $(popup).find('.object').each( function(index, element) {
                   newOption[ $(element).data('index') ] = $(element).val();
                });
                
                this.model.addOption(newOption, $(popup).find('input[type="checkbox"]').is(':checked'));
            }, this));
        },
        
        editOption : function(e) {
            var parent  = $(e.target).closest('tr'),
                select  = $(parent).find('[data-index="default"]').text() === "Yes" ? true : false,
                index   = $(parent).prop('id'),
                obj     = {};
                $(parent).find('.object').each(function(index, element) {
                    obj[ $(element).data('index') ] = $(element).text();
                });
        
            var html =  '<div id="myModal" class="modal span8 offset2 fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' + 
                        '   <div class="modal-header">'+
                        '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'+
                        '       <h3 id="myModalLabel">Add an option</h3>'+
                        '   </div>'+
                        '   <div class="modal-body">';
                _.each(this.model.constructor.schema['options']['values'], function(element, index) {
                    html +=     '<div class="row-fluid">'+
                                '   <input type="text" class="span8 offset2 object" data-index="'+index+'" placeholder="' + index + '"' + ' value="' + obj[index] + '" />'+
                                '</div><br />';
                });
                html += '       <div class="row-fluid"><label class="span3 offset2">Is the default value ? </label><input type="checkbox"' +(select ? "checked" : "") + '/></div>'+
                        '   </div>'+
                        '   <div class="modal-footer">'+
                        '       <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>'+
                        '       <button class="btn btn-primary saveChange">Save changes</button>'+
                        '   </div>'+
                        '</div>';
                
            var popup = $(html);
            
            $(popup).modal();
            
            $(popup).find('.saveChange').bind('click', _.bind(function(e) {
                
                obj = {};
                
                $(popup).find('.object').each( function(index, element) {
                   obj[ $(element).data('index') ] = $(element).val();
                });
                
                this.model.saveOption(index, obj, $(popup).find('input[type="checkbox"]').is(':checked'));
                $(popup).modal('hide');
                
            }, this));
        },
        
        
        /**
         * Get HTML template for an element
         * 
         * @param {type} element
         * @param {type} idx
         * @param {type} type
         * @param {type} section
         * @returns {String}
         */
        getSubTemplateHTML : function(element, idx, type, section) {
            
            switch (type) {
                
                case "integer" : 
                    var str = (section === "advanced") ? '<div class="advanced hide">' : '<div>';

                    return  str + '<div class="row-fluid">' +
                            '   <label class="span10 offset1">' + idx + '</label>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                            '   <input class="span10 offset1 property" type="number" data-attr="' + idx + '" placeholder="' + idx + '" value="' + element + '" />' +
                            '</div></div>';
                    
                case "string":
                default : 
                    var str = (section === "advanced") ? '<div class="advanced hide">' : '<div>';

                    return  str + '<div class="row-fluid">' +
                            '   <label class="span10 offset1">' + idx + '</label>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                            '   <input class="span10 offset1 property" type="text" data-attr="' + idx + '" placeholder="' + idx + '" value="' + element + '" />' +
                            '</div></div>';

                    case "boolean" :
                        if (section === "advanced") {
                            var str = '<div class="row-fluid advanced hide">&nbsp;</div><div class="row-fluid advanced hide">';
                        } else {
                            var str = '<div class="row-fluid">&nbsp;</div><div class="row-fluid">';
                        }

                        str += '   <label class="span4 offset1">' + idx + ' : </label>' +
                                '   <input class="span2 property" data-attr="' + idx + '" type="checkbox" ' + (element === true ? 'checked' : ' ') + ' />' +
                                '</div>';
                        return str;
            }
        },

        /**
         * Run through an object field and return the HTML
         * 
         * @param {type} element
         * @param {type} idx
         * @returns {String}
         */
        getSubTemplateForObject: function(element, idx) {

            var str = "", type = "", section = "";

            _.each(element, _.bind(function(subElement, index) {

                type    = this.model.getSchemaProperty(idx + "/" + index, 'type');
                section = this.model.getSchemaProperty(idx + "/" + index, 'section');

                str     += (type === "object") ? this.getSubTemplateForObject(subElement, idx + "/" + index) : this.getSubTemplateHTML(subElement, idx + "/" + index, type, section);

            }, this));

            return str;
        },
        
        /**
         * Return a table html template for array type element
         * 
         * @param {type} element
         * @param {type} idx
         * @returns {String}
         */
        getSubTemplateForArray : function(element, idx) {
            
            var i   = 0;
            var str =   '<div class="row-fluid">'+
                        '   <label class="span10 offset1">' + idx + '</label>'+
                        '</div>'+
                        '<table class="table table-stripped span10 offset1">' +
                        '   <thead>' +
                        '       <tr>';
            _.each (this.model.constructor.schema[idx]['values'], function(subHead, index) {
                str += '        <th>' + index + '</th>';
            });
            str +=      '       <th>Default value</th>'+
                        '       <th>Action</th>'+
                        '       </tr>' +
                        '   </thead>'+
                        '   <tbody>';
                
            _.each(element, _.bind(function(subElement, index) {
                str +=  '       <tr id="' + i + '">';
                _.each(subElement, function(values, id) {
                    str += '        <td data-index="'+ id + '" class="object">' + values + '</td>';
                });                
                str +=  '           <td data-index="default">' + ((subElement['value'] === this.model.get('defaultValue') ? "Yes" : "No")) + '</td>' +
                        '           <td><a href="#" class="edit">Edit</a> / <a href="#" class="remove">Remove</td>' +
                        '       </tr>';
                i++;
            }, this));            
            str +=      '       <tr>' + 
                        '           <td colspan="' + (_.size(element) + 2) + '" class="center">' +
                        '               <a href="#" class="addOption">Add an option</a>' + 
                        '           </td>'+
                        '       </tr>' +
                        '   </tbody>' +
                        '</table>';
                
            return str;
        },
        
        /**
         * Return field element HTML template
         * 
         * @param {type} element the element field
         * @param {type} idx the element field name
         * @returns {String} HTML template for model fields
         */
        getTemplate : function(element, idx, type) {    
            
            var el = this.model.constructor.schema[idx];

            if (el !== undefined) {
                
                var section = this.model.constructor.schema[idx];
                type    = type !== undefined ? type : this.model.constructor.schema[idx]['type'];

                switch (type) {
                    case "integer":
                    case "string" :
                    case "boolean":
                        return this.getSubTemplateHTML(element, idx, type, section);
                        break;

                    case "array" :
                        return this.getSubTemplateForArray(element, idx);
                        break;

                    case "object":
                        return this.getSubTemplateForObject(element, idx);
                        break;
                    
                    default : 
                        return "none";
                        break;
                }
            }

        }
        
    }, {
        templateSrc:    '<div id="accordion">'+
                        '   <h1>Settings</h1>'+
                        '   <div>'+
                        '       <h2>'+
                        '           <a href="#" id="simple" class="selected">Simple options</a> / <a href="#" id="advanced">Advanced options</a>'+
                        '       </h2>'+
                        '       <% _.each(this.model.attributes, _.bind(function(el, idx) { %> ' +
                        '           <%= this.getTemplate(el, idx) %>' +
                        '       <%}, this)); %>' +
                        '       <div class="row-fluid">&nbsp;</div>'+
                        '   </div>' +
                        '   <div class="row-fluid">&nbsp;</div>'+
                        '   <button class="close center" style="width: 100%">Save</button>'+
                        '</div>'
    });

    /**
     * Panel view
     */
    formBuild.PanelView = Backbone.View.extend({
        events: {
            'dblclick .fields': 'appendToDrop'
        },
        initialize: function(collection) {
            this._collection = collection;
            _.bindAll(this, 'appendToDrop');
        },
        appendToDrop : function(e) {
            $(e.target).disableSelection();
            
            if (formBuild[$(e.target).data("type") + 'Field'] !== undefined) {
                var f = new formBuild[$(e.target).data("type") + 'Field']({
                    id: this.collection.getSize()
                });
                this.collection.add(f);
            } else {
                alert ("Can't create field object");
            }            
        },
        render: function() {
            $(this.el).html(this.constructor.templateSrc);
            $('.fields').disableSelection();
            $(this.el).nanoScroller();
            return this;
        }
    }, {
        templateSrc :   '<div class="nano-content">'+
                            '<h1 class="center">Fields</h1>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Text">' +
                                    'Text' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Pattern">' +
                                    'Pattern' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="File">' +
                                    'File picker' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="LongText">' +
                                    'Long Text' +
                                '</div>' +
                            '</div>'+
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="TreeView">' +
                                    'Tree view' +
                                '</div>' +
                            '</div>'+
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Radio">' +
                                    'Radio buttons'+
                                '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="CheckBox">' +
                                    '<i class="fa fa-check-square-o"></i>&nbsp;Checkboxes' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Select">' +
                                    'Options' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Numeric">' +
                                    'Numéric' +
                                '</div>' +
                            '</div>' +
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Date">' +
                                    'Date' +
                                '</div>' +
                            '</div>'+
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="Hidden">' +
                                    'Hidden' +
                                '</div>' +
                            '</div>'+
                            '<h1 class="center">Layouts</h1>'+
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="hr">' +
                                    'Horizontal line' +
                                '</div>' +
                            '</div>'+
                            '<div class="row-fluid">' +
                                '<div class="span10 offset1 fields" data-type="fieldset">' +
                                    'Fieldset' +
                                '</div>' +
                            '</div>'+
                        '</div>'
    });

    /**
     * Hidden field view
     */
    formBuild.HiddenFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {});
        }
    }, {
        templateSrc :   '<label class="span3 grey">My hidden field</label> '+
                        '<input type="text" disabled class="span8" name="<%= name %>" id="<%= id%>" value="<%= value %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });
    
    //  -------------------------------------------------------
    //  Only graphical value
    //  -------------------------------------------------------
    
    /**
     * Display an horizontal line in the form
     */
    formBuild.HorizontalLineView = formBuild.BaseView.extend({
        render : function() {
            formBuild.BaseView.prototype.render.apply(this, arguments);
            $(this.el).addClass('min');
        }
    }, {
        templateSrc:    '<hr class="span10 offset1" />' +
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i> '+
                        '</div>'
    });
    
    return formBuild;

})(formBuilder);