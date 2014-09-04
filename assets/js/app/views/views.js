/**
 * @fileOverview view.js
 * 
 * This file implements all field and specific views
 *
 * Each field model has a specifig view representation
 *
 * Some views uses jquery ui to add some effect and for a better interface.
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(['jquery', 'underscore', 'backbone', 'app/router', 'fancytree'], function($, _, Backbone, router) {

    var views = {};

    /**
     * It's the basic views for all field view.
     */
    views.BaseView = Backbone.View.extend({

        /**
         * Events for the intercepted by the view
         */
        events: {
            'click  .trash' : 'removeView',
            'click .copy'   : 'copyModel',
            'focus input'   : 'updateSetting',
        },

        /**
         * Constructor
         */
        initialize: function(options) {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'removeView');
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.deleteView);

            this.el = options.el;
        },

        /**
         * Copy model of this view
         */
        copyModel : function() {
            var cl = this.model.clone();
            require (['app/formbuilder'], function(formbuilderInstance) {
                cl.set('id', formbuilderInstance.currentCollection.length);    //  change id otherwise element replaced copied element
                formbuilderInstance.currentCollection.add(cl);                 //  Add element to the collection
                formbuilderInstance.currentCollection.trigger('newElement', cl);
            });
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
            $(this.el).disableSelection();
            return this;
        },

        /**
         * Update view index, sortable callback
         *
         * @param {interger} idx new index of the view
         */
        updateIndex: function(idx) {
            this.model.id = parseInt(idx);
        }
    });


    /**
     * View for text field element
     */
    views.AutocompleteFieldView = views.BaseView.extend({

        /**
         * Get BaseView events and add sepecific TextFieldView event
         */
        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },

        /**
         * Render view
         */
        render : function() {
           views.BaseView.prototype.render.apply(this, arguments);
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


    views.TextFieldView = views.BaseView.extend({

        /**
         * Get BaseView events and add sepecific TextFieldView event
         */
        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },

        /**
         * Render view
         */
        render : function() {
           views.BaseView.prototype.render.apply(this, arguments);
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
        templateSrc:    '<div class="element "><div class="row" style="margin-left : 10px;">' +
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
    views.PatternFieldView = views.BaseView.extend({

        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },

        initialize : function() {
          views.BaseView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            views.BaseView.prototype.render.apply(this, arguments);
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
    views.FileFieldView = views.BaseView.extend({

        /**
         * Events of the view
         */
        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
                'change input[type="text"]'     : 'updateModel',
                'click input[type="submit"]'    : 'triggerFile',
                'click input[type="text"]'      : 'triggerFile',
                'change input[type="file"]'     : 'fileChange'
            });
        },

        initialize : function() {
          views.BaseView.prototype.initialize.apply(this, arguments);
        },

        triggerFile : function() {
            $(this.el).find('input[type="file"]').trigger('click');
        },

        render: function() {
            views.BaseView.prototype.render.apply(this, arguments);
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
    views.NumericFieldView = views.BaseView.extend({

        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
            });
        },

        render: function() {
            views.BaseView.prototype.render.apply(this, arguments);
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
    views.DateFieldView = views.BaseView.extend({
        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
            });
        },
       render : function() {
           views.BaseView.prototype.render.apply(this, arguments);
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
    views.LongTextFieldView = views.BaseView.extend({
        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
                'focus textarea'        : 'updateSetting'
            });
        },
        initialize : function() {
            views.BaseView.prototype.initialize.apply(this, arguments);
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
    views.TreeViewFieldView = views.BaseView.extend({
        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
            });
        },
        render : function() {
            views.BaseView.prototype.render.apply(this, arguments);
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
    views.RadioFieldView = views.BaseView.extend({
        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
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
    views.SelectFieldView = views.BaseView.extend({
        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
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
    views.CheckBoxFieldView = views.BaseView.extend({
        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
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
    views.HiddenFieldView = views.BaseView.extend({
        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {});
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
    views.HorizontalLineFieldView = views.BaseView.extend({
        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {});
        },
        render : function() {
            views.BaseView.prototype.render.apply(this, arguments);
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



    views.TableFieldView = views.BaseView.extend({

        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
                'delete'        : 'deleteSubView'
            });
        },

        initialize : function() {
            views.BaseView.prototype.initialize.apply(this, arguments);
            this._subView = [];
            _.bindAll(this, 'deleteSubView', 'renderSubView', 'render', 'addSubView');
        },

        addSubView : function(subViewID, subView, model) {
            this._subView[ _.size(this._subView)] = subViewID;
            this.model.addModel(model, subViewID);
        },

        render : function() {
            views.BaseView.prototype.render.apply(this, arguments);
            $('.tableField').droppable({
                accept : '.dropField',
                drop : _.bind(function(event, ui) {

                    // Check if the tableView is not empty
                    if ($(this.el).find('.empty').length > 0) {

                        require(['app/formbuilder'], _.bind(function(formbuilderInstance) {

                            var subViewID   = $(ui['draggable']).prop('id'),
                                subView     = formbuilderInstance.mainView.getSubView( subViewID ),
                                size        = 4 - $(this.el).find('.empty').length;

                            this.addSubView(subViewID, subView, subView.model)

                            $(this.el + ' #tableView' + size).switchClass('empty', 'used', 0)
                            $(this.el + ' #tableView' + size).find('i').remove();

                            subView.$el.remove();
                            setTimeout( _.bind(function() {
                                subView.$el.removeClass('dropField')
                                $(this.el + ' #tableView' + size).append(subView.$el );
                                subView.render();
                            }, this), 0)

                        }, this));

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
            require(['formbuilder'], _.bind(function(formbuilderInstance) {

                _.each(this._subView, _.bind(function(el, idx) {
                    if (el!= undefined && idx != undefined) {
                        this.$el.find('#tableView' + idx).append( formbuilderInstance.mainView.getSubView( el ).$el )
                        this.$el.find('#tableView' + idx).switchClass('empty', "used", 0);
                        formbuilderInstance.mainView.getSubView( el ).render();
                    }
                }, this));

            }, this));
        },

        deleteSubView : function(event) {
            delete this._subView[$(event.target).prop('id')];

            var index = $(event.target).prop('id').replace('tableView', '');
            this.model.removeModel( index );
            $(event.target).replaceWith(
                '<div class="span6 empty" id="' + $(event.target).prop('id') + '"><i class="fa fa-plus-square-o "> Drop field here</i></div>'
            )
        }

    }, {
        templateSrc :   '<div class="row-fluid element noMarginTop">'+
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

    views.SubformFieldView = views.BaseView.extend({

        events: function() {
            return _.extend({}, views.BaseView.prototype.events, {
                'delete'        : 'deleteSubView'
            });
        },

        initialize : function() {
            views.BaseView.prototype.initialize.apply(this, arguments);
            this._subView = [];
            _.bindAll(this, 'deleteSubView', 'renderSubView', 'addSubView', 'render');
        },

        addSubView : function(subViewID, subView, model) {
            this._subView[ _.size(this._subView)] = subViewID;
            this.model.addModel(model, subViewID);
        },

        render : function() {
            views.BaseView.prototype.render.apply(this, arguments);

            $('.subformField').droppable({
                accept      : '.dropField',
                hoverClass  : 'hovered',
                activeClass : 'hovered',

                drop : _.bind(function(event, ui) {

                    require(['formbuilder'], _.bind(function(formbuilderInstance) {

                        var subViewID   = $(ui['draggable']).prop('id'),
                            subView     = formbuilderInstance.mainView.getSubView( subViewID );

                        this.addSubView(subViewID, subView, subView.model)

                        $(this.el + ' fieldset').append('<div class="row-fluid sortableRow"></div>');
                        subView.$el.switchClass('span12', 'span10 offset1',0);
                        subView.$el.switchClass('dropField', 'subElement',0);

                        subView.$el.remove();
                        setTimeout( _.bind(function() {
                            $(this.el + ' fieldset .row-fluid:last').append(subView.$el );
                            subView.render();
                        }, this), 0)

                    }, this));

                }, this)
            });

            $(this.el).find('fieldset').sortable({
                cancel      : null,
                cursor      : 'pointer',
                axis        : 'y',
                items       : ".sortableRow",
                hoverClass : 'hovered',
                activeClass : 'hovered',
                stop: _.bind(function(event, ui) {
                    var id      = $(ui.item).find('.subElement').prop('id'),
                        from    = this._subView.indexOf(id),
                        to      = $(ui.item).index() - 1;

                    this._subView.splice(this._subView.indexOf(id), 1);
                    this._subView.splice(to, 0, id);
                    this.model.updateModel(id, from, to);
                }, this)
            });

            this.renderSubView();
            return this;
        },

        renderSubView : function() {
            require(['formbuilder'], _.bind(function(formbuilderInstance) {

                _.each(this._subView, _.bind(function(el, idx) {
                    if (el!= undefined && idx != undefined) {
                        this.$el.find('fieldset').append(
                            '<div class="row-fluid subElement ' + (idx == 0 ? 'noMarginTop' : '' )+ '" id="' + el + '"></div>'
                        )
                        $(this.el + ' fieldset .row-fluid:last').append(formbuilderInstance.mainView.getSubView( el ).$el );
                        formbuilderInstance.mainView.getSubView( el ).render();
                    }
                }, this));

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
                        '       <label class="span4 noMarginBottom">' +
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


    return views;
});