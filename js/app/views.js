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
$(document).ready(function() {

    /**
     * It's the basiv views for all field view.
     * Each view listen its model changes and readjust itself
     */
    app.BaseView = Backbone.View.extend({
        events: {
            'click  .fa-trash-o' : 'removeView',
            'click .fa-wrench'   : 'setting',
            'focus input'        : 'updateSetting'
        },
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'removeView', 'setting', 'updateSetting', 'getHtml');
            this.model.bind('change', this.render);
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
        removeView: function() {
            this.model.collection.remove(this.model);
            this.model.trigger('destroy');
            this.remove();
        },
        updateSetting : function() {
            if (!$('.dropArea').hasClass('span9')) {
                app.set = new app.SettingView({
                    model: this.model,
                    el: $('.settings')
                }).render();
            }
        },
        setting: function() {
            if ($('.dropArea').hasClass('span9')) {
                app.set.changeModel(this.model);
            }
        }
    });

    app.TextFieldView = app.BaseView.extend({
        events: function() {
            return _.extend({}, app.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },
        initialize : function() {
          app.BaseView.prototype.initialize.apply(this, arguments);
        },
        render : function() {
           app.BaseView.prototype.render.apply(this, arguments);
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

    app.NumericView = app.BaseView.extend({
        events: function() {
            return _.extend({}, app.BaseView.prototype.events, {
            });
        },
        render: function() {
            app.BaseView.prototype.render.apply(this, arguments);
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

    app.radioFieldView = app.BaseView.extend({
        events: function() {
            return _.extend({}, app.BaseView.prototype.events, {
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

    app.OptionsFieldView = app.BaseView.extend({
        events: function() {
            return _.extend({}, app.BaseView.prototype.events, {
                'click select'        : 'updateSetting'
            });
        },
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label> '+
                        '<select name="<% name %>" class="span8 <%= cssclass %>"> '+
                            '<% _.each(options, function(el) { %>' +
                                '<option value="<%= el.value %>" <% if (el.selected) {%> selected <% } %> ><%= el.label %></option>'+
                            '<% }) %>' +
                        '</select> '+
                        '<div class="span1 .pull-right"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div> '
    });

    app.checkboxView = app.BaseView.extend({
        events: function() {
            return _.extend({}, app.BaseView.prototype.events, {
            });
        },
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>"><%= label %></label>'+
                        '<div class="span8" style="border : 2px #eee solid;">'+
                            '<% _.each(options, function(el) { %>' +
                                '<label class="span12 noMarginLeft left"> '+
                                    '<input type="checkbox" class="<%= cssclass %>" style="margin-left: 10px;" name="<%= name %>" id="<%= id %>" value="<%= el.value%>" <% if (el.selected) {%> checked <% } %> /> '+
                                    '<%= el.label %>'+
                                '</label> '+
                            '<% }); %>'+
                        '</div>'+
                        '<div class="span1 .pull-right"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div>'
    });

    app.longTextView = app.BaseView.extend({
        events: function() {
            return _.extend({}, app.BaseView.prototype.events, {
                'focus textarea'        : 'updateSetting'
            });
        },
        initialize : function() {
            app.BaseView.prototype.initialize.apply(this, arguments);
            $(this.el).addClass('textArea');
        }
    }, {
        templateSrc:    '<label class="span3 <% if (required) { %> required <% } %>" ><%= label %></label>'+
                        '<textarea class="span8 <%= cssclass %>" style="<% if(!resizable){ %>resize: none<%}%>" class="span8"  name="<%= name %>" id="<%= id%>" placeholder="<%= placeholder %>"><%= value %></textarea>'+
                        '<div class="span1"> '+
                            '<i class="fa fa-trash-o"></i><i class="fa fa-wrench"></i> '+
                        '</div> '
    });

    app.DateView = app.BaseView.extend({
        events: function() {
            return _.extend({}, app.BaseView.prototype.events, {
            });
        },
       render : function() {
           app.BaseView.prototype.render.apply(this, arguments);
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

    app.FormView = Backbone.View.extend({
        events: {
            'change #protocolName' : 'changeFormName'
        },
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'addElement', 'changeFormName', 'importXML', 'downloadXML');
            //this.collection.bind("change", this.render);
            this.collection.bind('add', this.addElement);
            this._view = [];
        },
        addElement: function(el) {
            var classe = el.constructor.type,
                idx = this.collection.length,
                vue = null,
                id = "dropField" + idx;

            $('.drop').append('<div class="span12 dropField " id="' + id  + '" ></div>');

            switch (classe) {
                case 'text':
                    vue = new app.TextFieldView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case 'options':
                    vue = new app.OptionsFieldView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case 'longText':
                    vue = new app.longTextView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case "numeric" :
                    vue = new app.NumericView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case "checkbox" :
                    vue = new app.checkboxView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case "radio":
                    vue = new app.radioFieldView({
                        el      : $("#"+id),
                        model   : el
                    });
                    break;
                case "date":
                    vue = new app.DateView({
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
            var str = '<div id="popup">' + $('#popupDownload').html() + '</div>';
            var coll = this;
            $(str).dialog({
                modal       : true,
                width       : 700,
                resizable   : false,
                draggable   : false,
                position    : 'center',
                create: function() {
                    var parent = $(this);
                    $(this).find('button').click(function() {
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
            var str = '<div id="popup">' + $('#popup').html() + '</div>';
            var coll = this;
            $(str).dialog({
                modal       : true,
                width       : 700,
                resizable   : false,
                draggable   : false,
                position    : 'center',
                create : function() {
                    var parent = $(this);
                    $(this).find('input[type="file"]').change( function() {
                        var split = $(this).val().split('\\');
                        $(parent).find('#fileToImport').val( split[ split.length - 1] );
                    });
                    $(this).find('#findButton').click( function() {
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
                        '</div>'
    });

    app.SettingView = Backbone.View.extend({
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
            this.template = _.template( $.ajax({url: "templates/settingsTemplate.html", async: false }).responseText);
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
    });
    app.set = new app.SettingView({
        el: $('.settings')
    });
});