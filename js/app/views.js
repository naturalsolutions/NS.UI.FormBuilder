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
     * It's the basiv views for all field view.
     * Each view listen its model changes and readjust itself
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
            this.model.bind('destroy', this.deleteView)
        },
        updateIndex: function(idx) {
            this.model.set('order', idx);
        },
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        },
        getHtml : function() {
            var renderedContent = this.html(this.model.toJSON());
            return renderedContent;
        },
        deleteView : function() {
            $(this.el).remove()
            this.remove();
        },
        removeView: function() {
            this.model.collection.remove(this.model);
            this.model.trigger('destroy');
            $(this.el).remove()
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

    formBuild.TextFieldView = formBuild.BaseView.extend({
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
                        '<input type="text" class="span8 <%= cssclass %>" name="<%= name %>" readonly="readonly"  id="<%= id%>" placeholder="<%= placeholder %>" value="<%= value %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    formBuild.NumericView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
            });
        },
        render: function() {
            formBuild.BaseView.prototype.render.apply(this, arguments);
            $(this.model.id).spinner({
                step: this.model.step,
                min: this.model.minValue
            });
        }
    }, {
        templateSrc :   '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label> '+
                        '<input type="number" class="span8 <%= cssclass %> spin" name="<%= name %>" step="<%= step %>" id="<%= id%>" placeholder="<%= placeholder %>" min="<%= minValue %>" max="<%= maxValue %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    formBuild.radioFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'click input[type="radio"]'        : 'updateSetting'
            });
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label>'+
                        '<div class="span8" style="border : 2px #eee solid;" id="<%= id %>">'+
                            '<% _.each(options, function(el) { %>' +
                                '<label class="span12 noMarginLeft left"> '+
                                    '<input type="radio" class="<%= cssclass %>" style="margin-left: 10px;" name="<%= name %>" value="<%= el.value%>" <% if (el.selected) {%> checked <% } %> /> '+
                                    '<%= el.label %>'+
                                '</label> '+
                            '<% }); %>'+
                        '</div>'+
                        '<div class="span1 .pull-right"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    formBuild.OptionsFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change select'        : 'updateSelected'
            });
        },
        updateSelected : function(e) {
            this.model.updateSelectedOption($(e.target).find(':selected').data('idx'), true);
        },
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label> '+
                        '<select name="<% name %>" class="span8 <%= cssclass %>"> '+
                            '<% _.each(options, function(el, idx) { %>' +
                                '<option data-idx=<%= idx %> value="<%= el.value %>" <% if (el.selected) {%> selected <% } %> ><%= el.label %></option>'+
                            '<% }) %>' +
                        '</select> '+
                        '<div class="span1 .pull-right"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div> '
    });

    formBuild.checkboxView = formBuild.BaseView.extend({
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
                            '<% _.each(options, function(el, idx) { %>' +
                                '<label class="span12 noMarginLeft left"> '+
                                    '<input data-idx=<%= idx %> type="checkbox" class="<%= cssclass %>" style="margin-left: 10px;" name="<%= name %>" id="<%= id %>" value="<%= el.value%>" <% if (el.selected) {%> checked <% } %> /> '+
                                    '<%= el.label %>'+
                                '</label> '+
                            '<% }); %>'+
                        '</div>'+
                        '<div class="span1 .pull-right"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    formBuild.longTextView = formBuild.BaseView.extend({
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
                        '<textarea class="span8 <%= cssclass %>" style="<% if(!resizable){ %>resize: none<%}%>" class="span8"  name="<%= name %>" id="<%= id%>" placeholder="<%= placeholder %>"><%= value %></textarea>'+
                        '<div class="span1"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div> '
    });

    formBuild.DateView = formBuild.BaseView.extend({
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
                        '<input type="text" class="span8 <%= cssclass %>" name="<%= name %>" id="<%= id%>" placeholder="<%= placeholder %>" value="<%= value %>" /> '+
                        '<div class="span1"> '+
                        '   <i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    formBuild.FormView = Backbone.View.extend({
        events: {
            'change #protocolName' : 'changeFormName'
        },
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'addElement', 'changeFormName', 'importXML', 'downloadXML', 'updateView');
            this.collection.bind('add', this.addElement);
            this.collection.bind('change', this.updateView)
            this._view = [];
        },
        updateView : function() {
          $(this.el).find('#protocolName').val(this.collection.name)
        },
        addElement: function(el) {
            var classe = el.constructor.type,
                idx = this.collection.length,
                vue = null,
                id = $("#dropField" + idx).length > 0 ? "dropField" + (idx+1) : "dropField" + idx;
            $('.drop').append('<div class="span12 dropField " id="' + id  + '" ></div>');

            switch (classe) {
                case 'text':
                    vue = new formBuild.TextFieldView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case 'options':
                    vue = new formBuild.OptionsFieldView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case 'longText':
                    vue = new formBuild.longTextView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case "numeric" :
                    vue = new formBuild.NumericView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case "checkbox" :
                    vue = new formBuild.checkboxView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case "radio":
                    vue = new formBuild.radioFieldView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case "date":
                    vue = new formBuild.DateView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
            }
            if (vue !== null) {
                vue.render();
                this._view[id] = vue;
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
                                console.log("error : ", e);
                            }
                        } else {
                            alert ("You need to enter a name for your file");
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
                                        var result = coll.collection.validateXML(evt.target.result);
                                        if (result !== true) {
                                            var str = 'There is a error on the ' + result['element'] + '<br />';
                                            str += result['message'] + '<br />Please check your XML file';
                                            coll.displayError(result['error'], str);
                                        }
                                    } catch (err) {
                                        var str = "Your XML File can't be validated.<br />The specific error is : " + err;
                                        coll.displayError('Error during XML validation', str);
                                    }
                                };
                                reader.onerror = function(evt) {
                                    coll.displayError("An error was occured", 'An error was occure during reading file');
                                };
                            } else {
                                coll.displayError("File type error", 'Your have to give an XML file.');
                            }
                        } else {
                            coll.displayError("An error was occured", 'An error was occure during reading file');
                        }
                    });
                }
            });
        },
        displayError: function(title, msg) {
            var modal = $(
                            '<div id="dialog-message" title="' + title + '">' +
                                '<p>' +
                                    '<span class="ui-icon ui-icon-alert" style="float:left; margin:0 7px 50px 0;"></span>' +
                                    msg +
                                '</p>' +
                            '</div>'
                        );
            $(modal).dialog({
                modal       : true,
                width       : 500,
                height      : 250,
                position    : 'center',
                draggable   : false,
                buttons: {
                    Ok: function() {
                        $(this).dialog("close");
                    }
                }
            });
        }
    }, {
        templateSrc:    '<div class="row-fluid">'+
                            '<input type="text" id="protocolName" name="protocolName" value="<%= this.collection.name %>" />'+
                            '<hr/><br />' +
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

    formBuild.SettingView = Backbone.View.extend({
        events: {
            'click .close'          : 'hidePannel',
            'change input'          : 'updateModel',
            'click .addOp'          : "addOption",
            'click h2 > a'          : 'displayOptions',
            'click .saveOp'         : 'saveOption',
            'click .cancelOp'       : 'cancelOption',
            'click .removeOp'       : 'removeOption',
            'click .editOp'         : 'editOption',
            'click .saveChangeOp'   : 'saveChangeOption',
            'click .cancelChangeOp' : 'cancelChangeOption',
            'click #accordion h1'   : 'accordion'
        },
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc)
            _.bindAll(this, 'render', 'hidePannel', 'removePanel', 'changeModel', 'addOption');
            this.model = null;
            this._op = true;
        },
        displayOptions: function(e) {
            if (!$(e.target).hasClass('selected')) {
                $(".settings h2 > a").toggleClass('selected');
                if ($(e.target).prop('id') === "simple") {
                    $('.settings').find('.toHide').switchClass('toHide', 'hide', 500);
                } else {
                    $('.settings').find('.hide').switchClass('hide', 'toHide', 500);
                }
            }
        },
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
        hidePannel : function() {
            if ($('.dropArea').hasClass('span7')) {
                $('.dropArea').switchClass('span7', 'span9', 100);
                $('.widgetsPanel').toggle(100);
                this._op = true;
            }
        },
        updateModel: function(e) {

            if (this.model !== null && $(e.target).data('attr') !== "") {
                this._op = true;
                if ($(e.target).data('attr') === "required") {
                    this.model.set('required', $(e.target).is(":checked"));
                } else {
                    this.model.set($(e.target).data('attr'), $(e.target).val());
                }

            }
        },
        addOption: function() {
            $(this.el).find('table').append(
                '<tr>' +
                '   <td><input type="text" class="labelOp" placeholder="Label" /></td>' +
                '   <td><input type="text" class="valueOp" placeholder="value" /></td>' +
                '   <td><input type="checkbox" class="selectOp" /></td>' +
                '   <td class="center"><a href="#" class="saveOp">  Save</a> / <a href="#" class="cancelOp">cancel</a></td>'+
                '</tr>'
            );
        },
        accordion: function(e) {
            $(e.target).next('div').siblings('div').slideUp();
            $(e.target).next('div').slideToggle();
        },
        saveOption : function(e) {
            var parent = $(e.target).closest('tr');
            var label = $(parent).find('.labelOp').val(),
                value = $(parent).find('.valueOp').val(),
                select = $(parent).find('.selectOp').is(':checked');
            this._op = false;
            this.model.addOption(label, value, select);
        },
        cancelOption : function(e) {
            $(e.target).closest('tr').fadeOut(500, function() {
                $(this).remove();
            });
        },
        removeOption: function(e) {
            if (confirm("Are you sur ?")) {
                this._op = false;
                this.model.removeOption($(e.target).closest('tr').data('index'));
            }
        },
        saveChangeOption : function(e) {
            var parent = $(e.target).closest('tr');
            var label = $(parent).find('.labelOp').val(),
                value = $(parent).find('.valueOp').val(),
                select = $(parent).find('.selectOp').is(':checked'),
                index = $(parent).data('index');
            this._op = false;
            this.model.updateOption(index, label, value, select);
        },
        cancelChangeOption : function(e) {
            var parent = $(e.target).closest('tr');
            var index = $(parent).data('index');
            var obj = this.model.getOption(index);
            $(parent).replaceWith(
                '<tr data-index="' +  index + '">' +
                '   <td class="labelOp">' + obj.label + '</td>'+
                '   <td class="valueOp">' + obj.value + '</td>'+
                '   <td class="center selectOp">' + (obj.selected ? "Yes" : "No") + '</td>'+
                '   <td class="center"><a href="#" class="removeOp">Remove</a>&nbsp; / &nbsp;<a href="#" class="editOp">edit</a></td>'+
                '</tr>'
            );
        },
        editOption : function(e) {
            var parent = $(e.target).closest('tr');
            var label = $(parent).find('.labelOp').text(),
                value = $(parent).find('.valueOp').text(),
                select = $(parent).find('.selectOp').text() === "Yes" ? true : false,
                index = $(parent).data('index');

            var str = select ? '<td><input type="checkbox" class="selectOp" checked/></td>' : '<td><input type="checkbox" class="selectOp" /></td>';

            $(parent).replaceWith(
                '<tr data-index="' + index + '">' +
                '   <td><input type="text" class="labelOp" placeholder="Label" value="' + label + '" /></td>' +
                '   <td><input type="text" class="valueOp" placeholder="value" value="' + value + '"/></td>' +
                str +
                '   <td class="center"><a href="#" class="saveChangeOp">  Save</a> / <a href="#" class="cancelChangeOp">cancel</a></td>'+
                '</tr>'
            );
        }
    }, {
        templateSrc:    '<div id="accordion">'+
                            '<h1>Settings</h1>'+
                            '<div style="background : #eee" id="settingsPanel">'+
                                '<h2>'+
                                    '<a href="#" id="simple" class="selected">Simple options</a> / <a href="#" id="advanced">Advanced options</a>'+
                                '</h2>'+
                                '<% var fName = this.model.constructor.type; %>'+
                                '<div class="row-fluid">'+
                                    '<label class="span10 offset1">Field label</label>'+
                                '</div>'+
                                '<div class="row-fluid">'+
                                    '<input class="span10 offset1" type="text" id="fieldLabel" data-attr="label" placeholder="Field label" value="<%= label || "" %>" />'+
                                '</div>'+
                                '<% if(! _.contains(["radio", "checkbox", "options"], fName) ) { %>'+
                                    '<div class="row-fluid">'+
                                        '<label class="span10 offset1">Field placeholder value</label>'+
                                    '</div>'+
                                    '<div class="row-fluid">'+
                                        '<input class="span10 offset1" type="text" id="fieldPlaceholder" data-attr="placeholder" placeholder="Placeholder" value="<%= placeholder || "" %>" />'+
                                    '</div>'+
                                '<% } %>'+
                                '<% if(! _.contains(["radio", "checkbox", "options"], fName) ) { %>'+
                                    '<div class="row-fluid">'+
                                        '<label class="span10 offset1">Field default value</label>'+
                                    '</div>'+
                                    '<div class="row-fluid">'+
                                        '<input class="span10 offset1" type="text" id="fieldValue" data-attr="value" placeholder="Default value" value="<%= value %>" />'+
                                    '</div>'+
                                '<% } %>'+
                                '<div class="row-fluid hide">'+
                                    '<label class="span10 offset1">Field HTML Id</label>'+
                                '</div>'+
                                '<div class="row-fluid hide">'+
                                    '<input class="span10 offset1" type="text" id="fieldId" data-attr="id" placeholder="Field ID" value="<%= id %>"/>'+
                                '</div>'+
                                '<div class="row-fluid hide">'+
                                    '<label class="span10 offset1">Field HTML name</label>'+
                                '</div>'+
                                '<div class="row-fluid hide">'+
                                    '<input class="span10 offset1" type="text" id="fieldName" data-attr="name" placeholder="Field name" value="<%= name %>" />'+
                                '</div>'+
                                '<div class="row-fluid hide">'+
                                    '<label class="span10 offset1">Field HTML class</label>'+
                                '</div>'+
                                '<div class="row-fluid hide">'+
                                    '<input class="span10 offset1" type="text" id="fieldcssClass" data-attr="cssclass" placeholder="CSS class" value="<%= cssclass %>" />'+
                                '</div>'+
                                '<% if(fName == "date") { %>'+
                                    '<div class="row-fluid">'+
                                        '<label class="span10 offset1">Field date format</label>'+
                                    '</div>'+
                                    '<div class="row-fluid">'+
                                        '<input class="span10 offset1" type="text" id="fieldDateFormat" data-attr="format" placeholder="Field format (ex : 21/12/2012)" />'+
                                    '</div>'+
                                '<% } %>'+
                                '<% if(fName == "numeric") { %>'+
                                    '<div class="row-fluid">'+
                                        '<label class="span10 offset1">Min and max values</label>'+
                                    '</div>'+
                                    '<div class="row-fluid minMax" >'+
                                        '<input class="span4 offset1" type="number" data-attr="minValue" id="fielMinValue" placeholder="Min value" />'+
                                        '<label class="span2">And</label>'+
                                        '<input class="span4" type="number" id="fielMaxValue" data-attr="maxValue" placeholder="Max value" />'+
                                    '</div>'+
                                '<% } %>'+
                                '<% if( _.contains(["date", "text", "longtext"], fName) ) { %>'+
                                    '<div class="row-fluid">'+
                                        '<label class="span10 offset1">Field size</label>'+
                                    '</div>    '+
                                    '<div class="row-fluid">'+
                                        '<input type="number" class="span10 offset1" id="fieldSizeValue" data-attr="size" value="<%= size %>" />'+
                                    '</div>'+
                                '<% } %>'+
                                '<div class="row-fluid">&nbsp;</div>'+
                                '<div class="row-fluid">'+
                                    '<label class="span3 offset1">Required : </label> <input class="span2" data-attr="required" type="checkbox" id="fieldRequire" <% if ( required === true) { %> checked <% } %> />'+
                                '</div>'+
                                '<br />'+
                            '</div>'+
                            '<% if( _.contains(["radio", "checkbox", "options"], fName) ) { %>'+
                                '<h1>Options</h1>'+
                                '<div id="optionsPanel">'+
                                    '<div class="row-fluid">'+
                                        '<br />'+
                                        '<table class="table table-striped span11 offset1">'+
                                            '<thead>'+
                                                '<tr>'+
                                                    '<th>Label</th>'+
                                                    '<th>Value</th>'+
                                                    '<th>Default</th>'+
                                                    '<th>Option</th>'+
                                                '</tr>'+
                                            '</thead>'+
                                            '<tbody>'+
                                                '<% _.each(options, function(el, idx) { %> '+
                                                '<tr data-index="<%= idx %>">'+
                                                    '<td class="labelOp"><%= el.label %></td>'+
                                                    '<td class="valueOp"><%= el.value %></td>'+
                                                    '<td class="center selectOp"><%= el.selected ? "Yes" : "No" %></td>'+
                                                    '<td class="center"><a href="#" class="removeOp">Remove</a>&nbsp; / &nbsp;<a href="#" class="editOp">edit</a></td>'+
                                                '</tr> '+
                                                '<% }); %>'+
                                            '</tbody>'+
                                        '</table>'+
                                    '</div>'+
                                    '<br />'+
                                    '<button class="addOp center" style="width: 100%" >Add an option</button>'+
                                    '<br/>'+
                                '</div>'+
                            '<% } %>'+
                            '<br />'+
                            '<button class="close center" style="width: 100%">Save</button>'+
                        '</div>'
    });

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
            var form = this._collection;
            switch ($(e.target).data("type")) {
                case "text" :
                    var f = new formBuild.TextField({
                        id: "textField[" + form.collection.getSize() + "]",
                        name: "textField[" + form.collection.getSize() + "]",
                        placeholder: "Write some text...",
                        label: 'My Text field',
                        order: form.collection.getSize(),
                        required: true
                    });
                    form.collection.add(f);
                    break;

                case "options" :
                    var f = new formBuild.OptionsField({
                        id: "optionsField[" + form.collection.getSize() + "]",
                        name: "optionsField[" + form.collection.getSize() + "]",
                        label: 'My options field',
                        options: [
                            {value: "1", label: "My first option", selected: false},
                            {value: "2", label: "My second option", selected: true}
                        ]
                    });
                    form.collection.add(f);
                    break;

                case "longText" :
                    var f = new formBuild.LongTextField({
                        id: "longTextField[" + form.collection.getSize() + "]",
                        name: "longTextField[" + form.collection.getSize() + "]",
                        placeholder: "My long text field",
                        label: 'My long text',
                        resizable: false
                    });
                    form.collection.add(f);
                    break;

                case "numeric" :
                    var f = new formBuild.NumericField({
                        id: "numericField[" + form.collection.getSize() + "]",
                        name: "numericField[" + form.collection.getSize() + "]",
                        placeholder: "My numeric field ",
                        label: 'My numeric field',
                        required: true
                    });
                    form.collection.add(f);
                    break;

                case "check" :
                    var f = new formBuild.CheckBoxField({
                        id: "checkboxField[" + form.collection.getSize() + "]",
                        name: "checkboxField[" + form.collection.getSize() + "]",
                        label: 'My checkbox',
                        options: [
                            {value: "1", label: "My first checkbox", selected: false},
                            {value: "2", label: "My second checkbox", selected: true}
                        ]
                    });
                    form.collection.add(f);
                    break;

                case "radio" :
                    var f = new formBuild.RadioField({
                        id: "radioField[" + form.collection.getSize() + "]",
                        name: "radioField[" + form.collection.getSize() + "]",
                        label: 'My radio field',
                        options: [
                            {value: "1", label: "First radio", selected: true},
                            {value: "2", label: "Second radio", selected: false}
                        ]
                    });
                    form.collection.add(f);
                    break;

                case "date" :
                    var f = new formBuild.DateField({
                        id: "dateField[" + form.collection.getSize() + "]",
                        name: "dateField[" + form.collection.getSize() + "]",
                        placeholder: "Click to choose a date",
                        label: 'My date',
                        format: "dd/mm/yyy"
                    });
                    form.collection.add(f);
                    break;
            }
        },
        render: function() {
            $(this.el).html(this.constructor.templateSrc);
            $('.fields').disableSelection();
            $(this.el).nanoScroller();
            return this;
        }
    }, {
        templateSrc :   '<div class="nano-content"><h1 class="center">Fields</h1>' +
                        '<div class="row-fluid">' +
                            '<div class="span10 offset1 fields" data-type="text">' +
                                'Text' +
                            '</div>' +
                        '</div>' +
                        '<div class="row-fluid">' +
                            '<div class="span10 offset1 fields" data-type="longText">' +
                                'Long Text' +
                            '</div>' +
                        '</div>'+
                        '<div class="row-fluid">' +
                            '<div class="span10 offset1 fields" data-type="radio">' +
                                'Radio buttons'+
                            '</div>' +
                        '<div class="row-fluid">' +
                            '<div class="span10 offset1 fields" data-type="check">' +
                                '<i class="fa fa-check-square-o"></i>&nbsp;Checkboxes' +
                            '</div>' +
                        '</div>' +
                        '<div class="row-fluid">' +
                            '<div class="span10 offset1 fields" data-type="options">' +
                                'Options' +
                            '</div>' +
                        '</div>' +
                        '<div class="row-fluid">' +
                            '<div class="span10 offset1 fields" data-type="numeric">' +
                                'Numéric' +
                            '</div>' +
                        '</div>' +
                        '<div class="row-fluid">' +
                            '<div class="span10 offset1 fields" data-type="date">' +
                                'Date' +
                            '</div>' +
                        '</div></div>'
    });

    return formBuild;

})(formBuilder);