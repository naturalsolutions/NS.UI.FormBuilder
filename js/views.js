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

var formBuilder = (function(app) {


    /**
     * It's the basic views for all field view.
     */
    app.views.BaseView = Backbone.View.extend({

        /**
         * Events for the intercepted by the view
         */
        events: {
            'click  .trash' : 'removeView',
            'click .copy'   : 'copyModel',
            'focus input'   : 'updateSetting',
//            "move"          : 'moveView'
            'dropped' : 'viewDropped'
        },

        /**
         * Constructor
         */
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'removeView', 'deleteView', 'viewDropped');
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.deleteView);
        },

        viewDropped : function(event, data) {
            $(data).trigger('droppedModel', this.model.get('id'));
            this.removeView();
        },

        /**
         * Event callback send by TableFieldView when view is dropped
         *
         * @param  {[type]} e  [description]
         * @param  {[type]} el [description]
         * @param  {[type]} id [description]
         * @return {[type]}    [description]
         */
        moveView : function(e, el, id) {
            var last = this.el;
            this.setElement(el);
            this.render();

            $(this.el).switchClass('empty', 'used');
            $(last).remove();

            //  Send event
            $('#' + id).trigger('viewAdded', this)
        },

        /**
         * Copy model of this view
         */
        copyModel : function() {
            var cl = this.model.clone();
            cl.set('id', app.views.mainView.formView.collection.length);    //  change id otherwise element replaced copied element
            app.views.mainView.formView.collection.add(cl);                 //  Add element to the collection
        },

        /**
         * Remove view
         */
        removeView: function() {
            $(this.el).trigger('delete');
            $(this.el).remove();
            this.remove();
        },

        /**
         * Render view
         *
         * @returns {app.views.BaseView} view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        },

        /**
         * Update view index, sortable callback
         *
         * @param {interger} idx new index of the view
         */
        updateIndex: function(idx) {
            this.model.id = parseInt(idx);
        },

        /**
         * Remove the view
         */
        deleteView : function() {
            $(this.el).trigger('delete');
            $(this.el).remove();
            this.remove();
        }

    });


    /**
     * View for text field element
     */
    app.views.AutocompleteFieldView = app.views.BaseView.extend({

        /**
         * Get BaseView events and add sepecific TextFieldView event
         */
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },

        /**
         * Render view
         */
        render : function() {
           app.views.BaseView.prototype.render.apply(this, arguments);
           $('#autocompleteExample').typeahead({
                source: function(query, process) {
                    return $.getJSON( app.instances.autocompleteURL + 'example.json', {query : query}, function(data) {
                        return process(data.options);
                    });
                },
                updater : _.bind(function(item) {

                    this.model.set('defaultValue', item);
                }, this)
            });
       },

       /**
        * Change model value when text input value changed
        *
        * @param {object} jQuery event
        */
        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }

    }, {
        templateSrc:    '<div class="element"><div class="row" style="margin-left : 10px;">' +
                        '   <label class="span4">' +
                        '       <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '       <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '   <div class="span8 right actions">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '   </div>'+
                        '</div>' +
                        '<div class="row" style="margin-left : 10px;">' +
                        '   <input id="autocompleteExample" type="text" class="span12" name="<%= name %>" id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" data-provide="typeahead" /> '+
                        '</div></div>'
    });


    app.views.TextFieldView = app.views.BaseView.extend({

        /**
         * Get BaseView events and add sepecific TextFieldView event
         */
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },

        /**
         * Render view
         */
        render : function() {
           app.views.BaseView.prototype.render.apply(this, arguments);
       },

       /**
        * Change model value when text input value changed
        *
        * @param {object} jQuery event
        */
        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }

    }, {
        templateSrc:    '<div class="element"><div class="row" style="margin-left : 10px;">' +
                        '   <label class="span4">' +
                        '       <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '       <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '   <div class="span8 right actions">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '   </div>'+
                        '</div>' +
                        '<div class="row" style="margin-left : 10px;">' +
                        '   <input type="text" class="span12" name="<%= name %>" id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" /> '+
                        '</div></div>'
    });


    /**
     * View for pattern field
     */
    app.views.PatternFieldView = app.views.BaseView.extend({

        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },

        initialize : function() {
          app.views.BaseView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            app.views.BaseView.prototype.render.apply(this, arguments);
        },

        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }

    }, {
        templateSrc:    '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <label class="span4">' +
                        '           <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '           <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '       <div class="span8 right actions">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '       </div>'+
                        '   </div>' +
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <input type="text" class="span12" name="<%= name %>" id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" pattern="<%= pattern %>" /> '+
                        '   </div>'+
                        '</div>'
    });


    /**
     * file field view
     */
    app.views.FileFieldView = app.views.BaseView.extend({

        /**
         * Events of the view
         */
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'change input[type="text"]'     : 'updateModel',
                'click input[type="submit"]'    : 'triggerFile',
                'click input[type="text"]'      : 'triggerFile',
                'change input[type="file"]'     : 'fileChange'
            });
        },

        initialize : function() {
          app.views.BaseView.prototype.initialize.apply(this, arguments);
        },

        triggerFile : function() {
            $(this.el).find('input[type="file"]').trigger('click');
        },

        render: function() {
            app.views.BaseView.prototype.render.apply(this, arguments);
            $(this.el).find('input[type="text"]').enableSelection();
        },

        /**
         * Set text input value vhen file input value changes
         *
         * @param {type} e jQuery event
         */
        fileChange: function(e) {
            $(this.el).find('input[type="text"]').val($(e.target).val().replace("C:\\fakepath\\", ""))
        },

        updateModel: function(e) {
            this.model.set('value', $(e.target).val());
        }
    }, {
        templateSrc:    '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <label class="span4">' +
                        '           <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '           <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '       <div class="span8 right actions">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '       </div>'+
                        '   </div>' +
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <input type="file" class="hide" />' +
                        '       <input type="text" class="span10" name="<%= name %>" id="<%= id%>" value="<%= defaultValue %>" /> '+
                        '       <input type="submit" value="Find" class="span2" />'+
                        '   </div>' +
                        '</div>'
    });


    /**
     * NumericFieldView
     */
    app.views.NumericFieldView = app.views.BaseView.extend({

        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
            });
        },

        render: function() {
            app.views.BaseView.prototype.render.apply(this, arguments);
            $(this.el).find('input').spinner({
                step: this.model.step,
                min: this.model.minValue
            }).parent('span').addClass('span10');
        }
    }, {
        templateSrc :   '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <label class="span4">' +
                        '           <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '           <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '       <div class="span8 right actions">'+
                        '           <a href="#" class="trash">'+
                        '               <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '           </a>'+
                        '           <a href="#setting/<%= id %>" class="wrench">'+
                        '               <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                        '           </a>'+
                        '           <a href="#" class="copy">'+
                        '               &nbsp;<span class="fa fa-copy"></span>'+
                        '               <span data-i18n="actions.clone">Dupliquer</span>'+
                        '           </a>'+
                        '       </div>'+
                        '   </div>' +
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <input class="span12 spin" name="<%= name %>" step="<%= precision %>" id="<%= id%>" placeholder="<%= hint %>" min="<%= minValue %>" max="<%= maxValue %>" value="<% defaultValue || 0 %>" /> '+
                        '       <label>&nbsp;<%= unity %></label>' +
                        '   </div>'+
                        '</div>'

    });


    /**
     * date field view
     */
    app.views.DateFieldView = app.views.BaseView.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
            });
        },
       render : function() {
           app.views.BaseView.prototype.render.apply(this, arguments);
           $(this.el).find('input').datepicker({
               format: this.model.get('format')
           });
       }
    }, {
        templateSrc:    '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <label class="span4">' +
                        '           <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '           <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '       <div class="span8 right actions">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '       </div>'+
                        '   </div>' +
                        '   <div class="row" style="margin-left : 10px;">' +
                        '   <input type="text" class="span12" name="<%= name %>" id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" /> '+
                        '   </div>' +
                        '</div>'
    });


    /**
     * Long text view
     */
    app.views.LongTextFieldView = app.views.BaseView.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'focus textarea'        : 'updateSetting'
            });
        },
        initialize : function() {
            app.views.BaseView.prototype.initialize.apply(this, arguments);
            $(this.el).addClass('textArea');
        }
    }, {
        templateSrc:    '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <label class="span4">' +
                        '           <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '           <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '       <div class="span8 right actions">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '       </div>'+
                        '   </div>' +
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <textarea style="resize: none" class="span12"  name="<%= name %>" id="<%= id%>" placeholder="<%= hint %>"><%= defaultValue %></textarea>'+
                        '   </div>' +
                        '</div>'
    });

    //  FIX edition view

    /**
     * Tree view field view
     */
    app.views.TreeViewFieldView = app.views.BaseView.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
            });
        },
        render : function() {
            app.views.BaseView.prototype.render.apply(this, arguments);
            var src = this.model.get('node');
            $(this.el).find('#tree').fancytree({
                source: src,
                checkbox : true,
                selectMode : 2
            });
        }
    }, {
        templateSrc:    '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <label class="span4">' +
                        '           <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '           <% if (required === true) { %> * <% } %> <%= label %>'+
                        '       </label> '+
                        '       <div class="span8 right actions">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '       </div>'+
                        '   </div>' +
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <div class="span12" id="tree"></div>' +
                        '   </div>' +
                        '</div>'
    });


    /**
     * Radio field view
     */
    app.views.RadioFieldView = app.views.BaseView.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'click input[type="radio"]'        : 'updateSetting'
            });
        }
    }, {
        templateSrc:    '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' +
                        '      <label class="span4">' +
                        '          <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '          <% if (required === true) { %> * <% } %> <%= label %>'+
                        '      </label>'+
                        '      <div class="span8 right actions">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '      </div>'+
                        '   </div>'+
                        '   <div class="row" style="margin-left : 10px;">' +
                        '      <div class="span12" style="border : 2px #eee solid;" id="<%= id %>">'+
                        '          <% _.each(itemList["items"], function(el, index) { %>' +
                        '              <label class="span12 noMarginLeft left"> '+
                        '              <input type="radio" style="margin-left: 10px;" name="<%= name %>" <% if (itemList["defaultValue"] == el["id"]){ %> checked <% } %> value="<%= el.value %>"  /> '+
                        '                  <%= el.en %>'+
                        '              </label> '+
                        '          <% }); %>'+
                        '      </div>'+
                        '   </div>'    +
                        '</div>'
    });

    /**
     * Options field vue
     */
    app.views.SelectFieldView = app.views.BaseView.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'change select'        : 'updateSelected'
            });
        },
        updateSelected : function(e) {
            this.model.updateSelectedOption($(e.target).find(':selected').data('idx'), true);
        }
    }, {
        templateSrc:    '<div class="element"><div class="row" style="margin-left : 10px;">' +
                        '   <label class="span4">' +
                        '       <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '       <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '   <div class="span8 right actions">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '   </div>'+
                        '</div>' +
                        '<div class="row" style="margin-left : 10px;">' +
                        '   <select name="<% name %>" class="span12"> '+
                        '       <% _.each(itemList["items"], function(el, idx) { %>' +
                        '           <option data-idx=<%= idx %> value="<%= el.value %>" <% if (itemList["defaultValue"] == el["id"]){ %> selected <% } %> ><%= el.en %></option>'+
                        '       <% }) %>' +
                        '   </select> '+
                        '</div></div>'
    });

    /**
     * Checkbox field view
     */
    app.views.CheckBoxFieldView = app.views.BaseView.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'change input[type="checkbox"]' : 'updateSelected'
            });
        },
        updateSelected : function(e) {
            this.model.updateSelectedOption($(e.target).data('idx'), $(e.target).is(':checked'));
        },
    }, {
        templateSrc:    '<div class="element">'+
                        '<div class="row" style="margin-left : 10px;">' +
                        '   <label class="span4">' +
                        '       <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '       <% if (required === true) { %> * <% } %> <%= label %>'+
                        '   </label>'+
                        '   <div class="span8 right actions">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '   </div>'+
                        '</div>'+
                        '<div class="row" style="margin-left : 10px;">' +
                        '<div class="span12" style="border : 2px #eee solid;">'+
                            '<% _.each(itemList["items"], function(el, idx) { %>' +
                                '<label class="span12 noMarginLeft left"> '+
                                    '<input data-idx=<%= idx %> type="checkbox" style="margin-left: 10px;" name="<%= name %>" id="<%= id %>" value="<%= el.value%>" <% if (itemList["defaultValue"] == el["id"]){ %> checked <% } %> /> '+
                                    '<%= el.en %>'+
                                '</label> '+
                            '<% }); %>'+
                        '</div>'+
                        '</div>' +
                        '</div>'
    });


    /**
     * Hidden field view
     */
    app.views.HiddenFieldView = app.views.BaseView.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {});
        }
    }, {
        templateSrc :   '<div class="element"><div class="row" style="margin-left : 10px;">' +
                        '   <label class="span4">' +
                        '       <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '       &nbsp;</label> '+
                        '   <div class="span8 right actions">'+
                        '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#option/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '   </div>'+
                        '</div>' +
                        '<div class="row" style="margin-left : 10px;">' +
                        '   <input type="text"  class="span12" name="<%= name %>" id="<%= id%>" value="<%= value %>" disabled="disabled" /> '+
                        '</div></div>'
    });

    /**
     * Display an horizontal line in the form
     */
    app.views.HorizontalLineFieldView = app.views.BaseView.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {});
        },
        render : function() {
            app.views.BaseView.prototype.render.apply(this, arguments);
        }
    }, {
        templateSrc:    '<div class="element"><div class="row" style="margin-left : 10px;">' +
                        '   <label class="span4">' +
                        '       <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '       &nbsp;</label> '+
                        '   <div class="span8 right actions">'+
                         '       <a href="#" class="trash">'+
                        '           <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '       </a>'+
                        '       <a href="#" class="copy">'+
                        '           &nbsp;<span class="fa fa-copy"></span>'+
                        '           <span data-i18n="actions.clone">Dupliquer</span>'+
                        '       </a>'+
                        '   </div>'+
                        '</div>' +
                        '<div class="row" style="margin-left : 10px;">' +
                        '   <hr class="span12" />' +
                        '</div></div>'
    });



    app.views.TableFieldView = app.views.BaseView.extend({

        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'delete'        : 'deleteSubView',
                'droppedModel'  : 'droppedModel'
            });
        },

        initialize : function() {
            app.views.BaseView.prototype.initialize.apply(this, arguments);
            this._subView = {};
            _.bindAll(this, 'deleteSubView', 'droppedModel', 'renderSubView', 'updateModel', 'addSubView');
            this.model.bind('update', this.updateModel);
        },

        droppedModel : function(event, modelID) {
            var droppedViewModel        = app.instances.currentForm.get(modelID),
                droppedViewModelType    = droppedViewModel.constructor.type,
                tableElementLeft        = $(this.el).find('.empty').length,
                newSubViewEl            = '#tableView' + (4 - tableElementLeft),
                newSubView              = new app.views[droppedViewModelType + 'FieldView']({ model : droppedViewModel, el : newSubViewEl });

            droppedViewModel.set('isDragged', true);
            this.model.addModel(droppedViewModel, 4 - tableElementLeft);
            newSubView.render();
            $(newSubViewEl).switchClass('empty', 'used');
            this._subView[newSubViewEl] = newSubView;
        },

        render : function() {
            app.views.BaseView.prototype.render.apply(this, arguments);
            $('.tableField').droppable({
                accept : '.dropField',
                drop : _.bind(function(event, ui) {

                    // Check if the tableView is not empty
                    if ($(this.el).find('.empty').length > 0) {
                        $(ui['draggable']).trigger('dropped', this.el);
                    } else {
                        $(".dropArea").animate({ scrollTop: 0 }, "medium");
                        new NS.UI.Notification({
                            type    : 'warning',
                            title   : 'Limit :',
                            message : "You table field is full"
                        });
                    }

                }, this)
            });
            this.renderSubView();
            return this;
        },

        renderSubView : function() {
            _.each(this._subView, _.bind(function(el, idx) {
                console.log (idx, el);
            }, this));
        },

        deleteSubView : function(event) {
            delete this._subView[$(event.target).prop('id')];

            var index = $(event.target).prop('id').replace('tableView', '');
            this.model.removeModel( index );
            $(event.target).replaceWith(
                '<div class="span6 empty" id="' + $(event.target).prop('id') + '"><i class="fa fa-plus-square-o "> Drop field here</i></div>'
            )
        },

        updateModel : function(currentViewIndex, newViewIndex) {
            var currentSubViewEl    = '#tableView' + currentViewIndex
                newSubViewEl        = '#tableView' + newViewIndex,
                view                = this._subView[currentSubViewEl],
                otherView           = this._subView[newSubViewEl] !== undefined ? this._subView[newSubViewEl] : null;

            if (otherView !== null) {
                this._subView[currentSubViewEl] = this._subView[newSubViewEl];
                this._subView[newSubViewEl] = view;

                view.setElement(newSubViewEl);
                otherView.setElement(currentSubViewEl);
                view.render();
                otherView.render();
            } else {
                view.setElement(newSubViewEl)
                $(newSubViewEl).switchClass('empty', 'used')
                $(currentSubViewEl).replaceWith('<div class="span6 empty" id="tableView' + currentViewIndex + '"><i class="fa fa-plus-square-o "> Drop field here</i></div>')
                view.render();
                this._subView[newSubViewEl] = view;
                this._subView['#tableView' + currentViewIndex] = null;
            }
        },

        addSubView : function(viewEl, model) {
            var vue = new app.views[model.constructor.type + 'FieldView']({ model : model, el : viewEl });
            this._subView[viewEl] = vue;
            vue.render();
            $(viewEl).switchClass('empty', 'used');
        }

    }, {
        templateSrc :   '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <label class="span4">' +
                        '           <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '           &nbsp;'+
                        '       </label> '+
                        '       <div class="span8 right actions">'+
                         '          <a href="#" class="trash">'+
                        '               <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '           </a>'+
                        '       <a href="#setting/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '           <a href="#" class="copy">'+
                        '               &nbsp;<span class="fa fa-copy"></span>'+
                        '               <span data-i18n="actions.clone">Dupliquer</span>'+
                        '           </a>'+
                        '       </div>'+
                        '   </div>' +
                        '   <div class="row tableField" style="margin-left : 10px;">' +
                        '       <div class="row-fluid">'+
                        '           <div class="span6 empty" id="tableView0"><i class="fa fa-plus-square-o "> Drop field here</i></div>'+
                        '           <div class="span6 empty" id="tableView1"><i class="fa fa-plus-square-o "> Drop field here</i></div>'+
                        '       </div>'+
                        '       <div class="row-fluid">'+
                        '           <div class="span6 empty" id="tableView2"><i class="fa fa-plus-square-o "> Drop field here</i></div>'+
                        '           <div class="span6 empty" id="tableView3"><i class="fa fa-plus-square-o "> Drop field here</i></div>'+
                        '       </div>'+
                        '   </div>'+
                        '</div>'
    });

    app.views.SubformFieldView = app.views.BaseView.extend({

        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'delete'        : 'deleteSubView',
                'droppedModel'  : 'droppedModel'
            });
        },

        initialize : function() {
            app.views.BaseView.prototype.initialize.apply(this, arguments);
            this._subView = {};
            _.bindAll(this, 'deleteSubView', 'droppedModel', 'renderSubView', 'addSubView', 'render');
            //this.model.bind('update', this.updateModel);
        },

        droppedModel : function(event, modelID) {
            var droppedViewModel     = app.instances.currentForm.get(modelID),
                subformSize          = Object.keys(this._subView).length,
                newSubViewEl         = 'subform' + subformSize;

            $(this.el).find('fieldset').append(
                '<div class="row-fluid subelement ' + (subformSize === 0 ? 'noMarginTop' : 'marginTop25') + '" id="' + newSubViewEl + '"></div>'
            );

            this.addSubView(droppedViewModel.constructor.type + 'FieldView', droppedViewModel, newSubViewEl, subformSize)
        },

        addSubView : function(viewType, model, viewEl, subformSize) {
            var newSubView = new app.views[viewType]({ model : model, el : '#' + viewEl});

            model.set('isDragged', true);
            this.model.addModel(model, subformSize);

            newSubView.render();
            this._subView[viewEl] = newSubView;
        },

        render : function() {
            app.views.BaseView.prototype.render.apply(this, arguments);
            $('.subformField').droppable({
                accept : '.dropField',
                drop : _.bind(function(event, ui) {
                    $(ui['draggable']).trigger('dropped', this.el);
                }, this)
            });

            $(this.el).find('fieldset').sortable({
                cancel      : null,
                cursor      : 'pointer',
                axis        : 'y',
                items       : ".subelement",
                stop: _.bind(function(event, ui) {
                    $(this.el).find('.subelement').removeClass('noMarginTop');
                    $(this.el).find('.subelement').first().switchClass('marginTop25', 'noMarginTop');
                    for (var v in this._subView) {
                        this._subView[v].updateIndex($('#' + v).index());
                    }
                }, this)
            });

            this.renderSubView();
            return this;
        },

        renderSubView : function() {
            _.each(this._subView, _.bind(function(el, idx) {
                console.log (idx, el);
            }, this));
        },

        deleteSubView : function(event) {
            delete this._subView[$(event.target).prop('id')];

            var index = $(event.target).prop('id').replace('subform', '');
            this.model.removeModel( index );
            $(event.target).replaceWith('')
        }

    }, {
        templateSrc :   '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' +
                        '       <label class="span4">' +
                        '           <i class="fa fa-arrows" style="color : #09C"></i>' +
                        '           &nbsp;'+
                        '       </label> '+
                        '       <div class="span8 right actions">'+
                         '          <a href="#" class="trash">'+
                        '               <i class="fa fa-trash-o"></i><span data-i18n="actions.delete">Supprimer</span>'+
                        '           </a>'+
                        '       <a href="#option/<%= id %>" class="wrench">'+
                        '           <i class="fa fa-wrench"></i><span data-i18n="actions.edit">Modifier</span>'+
                                '</a>'+
                        '           <a href="#" class="copy">'+
                        '               &nbsp;<span class="fa fa-copy"></span>'+
                        '               <span data-i18n="actions.clone">Dupliquer</span>'+
                        '           </a>'+
                        '       </div>'+
                        '   </div>' +
                        '   <fieldset class="row subformField" style="margin-left : 10px;"><legend><%= legend %>' +
                        '   </fieldset>'+
                        '</div>'
    });




    return app;

})(formBuilder);