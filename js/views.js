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

//
    //  ----------------------------------------------------------------------------------
    //  Base views
    
    /**
     * It's the basic views for all field view.
     */
    app.views.BaseView = Backbone.View.extend({
        
        /**
         * Events for the intercepted by the view
         */
        events: {
            'click  .trash'         : 'removeView',
            'click .copy'           : 'copyModel',
            'focus input'           : 'updateSetting',
            'mouseenter .element'   : 'displayOption',
            'mouseleave .element'   : 'hideOption'
        },
        
        /**
         * Constructor
         */
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'removeView', 'deleteView');
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.deleteView);
        },
        
        /**
         * Display allowed options for this element
         * 
         * @param {object} e jQuery event
         */
        hideOption : function(e) {
            $(e.delegateTarget).find('.right').addClass('hide');
        },
        
        /**
         * Hide displayed options
         * 
         * @param {object} e jQuery event
         */
        displayOption : function(e) {
            $(e.delegateTarget).find('.right').removeClass('hide');
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
            $(this.el).remove();
            this.remove();
        },
        
    });
    
    /**
     * Basic edition view for all field edition view
     */
    app.views.BaseEditView = Backbone.View.extend({
        
        /**
         * Evenet intercepted by the view
         */
        events : {
            'click h2 > a:not(.selected)'   : 'displayOptions',
            'change .property'              : 'updateModelAttribute'
        },
        
        /**
         * Constructor
         */
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'updateModelAttribute', 'changeModel');
            this.model.bind('change', this.render);
            this.subView = null;
        },
        
        /**
         * Display options by section level (simple or advanced)
         * 
         * @param {object} e jQuery event
         */
        displayOptions: function(e) {
            $(".settings h2 > a").toggleClass('selected');
            if ($(e.target).prop('id') === "simple") {
                $('.advanced').addClass('hide', 500);
            } else {
                $('.advanced').removeClass('hide', 500);
            }
        },
        
        /**
         * Update model property when input value has changed
         * 
         * @param {object} e jQuery event
         */
        updateModelAttribute: function(e) {            
            if ($(e.target).prop("type") === "checkbox") {
                this.model.changePropertyValue($(e.target).data('attr'), $(e.target).is(':checked'));
            } else {
                this.model.changePropertyValue($(e.target).data('attr'), $(e.target).val());
            }
        },
        

        /**
         * Render view 
         * 
         * @returns {app.views.BaseView} view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);

            this.subView = new app.views[this.model.constructor.type + 'FieldEditView']({
               el : $('#subView') ,
               model : this.model
            });
            this.subView.render();
            $(this.el).i18n();
            
            //  Animate panel
            $('.dropArea').switchClass('span9', 'span7', 500);
            $('.widgetsPanel').switchClass('span3', 'span0', 500);
            
            return this;
        },

        changeModel : function(newModel) {

            //  Complety remove subview
            this.subView.undelegateEvents();
            this.subView.$el.removeData().unbind(); 
            this.subView.remove();  
            Backbone.View.prototype.remove.call(this.subView);
            this.subView = undefined;
            delete this.subView;

            //  unbind model view
            this.unbind();           
            this.model = newModel;
            this.model.bind('change', this.render);     

            $('.lastRow').after('<div id="subView"></div>');
            this.model.trigger('change');
        },

        getActions : function() {
            return {
                'save' : new NS.UI.NavBar.Action({
                    handler : function() {
                        if ($('.dropArea').hasClass('span7')) {
                            $('.dropArea').switchClass('span7', 'span9', 100);
                            $('.widgetsPanel').switchClass('span0', 'span3', 200);
                            app.instances.router.navigate("#", {
                                trigger : true
                            });
                        }
                    },
                    allowedRoles: ["reader"],
                    title: '<i class="fa fa-bars"></i> Save changes'
                })
            };
        }
    
    }, {
        templateSrc : '<div>'+
                        '   <h1 data-i18n="label.settings">Settings</h1>'+
                        '   <div>'+
                        '       <h2>'+
                        '           <a href="#" id="simple" class="selected" data-i18n="label.options.simple">Simple options</a> / '+
                        '           <a href="#" id="advanced" data-i18n="label.options.advanced" >Advanced options</a>'+
                        '       </h2>'+
                        //  Edition of common attribute like name (label and displayLabel)
                        '   <div class="hide advanced">' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">ID</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="number" data-attr="id" placeholder="Id" value="<%= id %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">Label</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="label" placeholder="Label" value="<%= label %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">Name label</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="name[label][value]" placeholder="Name label" value="<%= name["label"]["value"] %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">Name label lang</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="name[label][lang]" placeholder="Name label lang" value="<%= name["label"]["lang"] %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '   <div class="row-fluid">&nbsp;</div><div class="row-fluid">' +
                        '       <label class="span4 offset1">Required</label>' +
                        '           <input class="span2 property" data-attr="required" type="checkbox" <% if (required) { %> checked <% } %> />' +
                        '   </div>' +
                        '   <div class="row-fluid lastRow">&nbsp;</div><div class="row-fluid">' +
                        '       <label class="span4 offset1">Read only</label>' +
                        '           <input class="span2 property" data-attr="readOnly" type="checkbox" <% if (readOnly) { %> checked <% } %> />' +
                        '   </div>' +
                        //  end
                        '       <div id="subView"></div>' +
                        '       <div class="row-fluid">&nbsp;</div>'+
                        '   </div>' +
                        '   <div class="row-fluid">&nbsp;</div>'+
                        '</div>'
    }); 
    
    
    
    //  ----------------------------------------------------------------------------------
    //  TextField views
    
    /**
     * View for text field element
     */
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
                        '   <div class="span8 right hide actions">'+
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

    app.views.TextFieldEditView = Backbone.View.extend({
        
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },
        
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        },
        
    }, {
        templateSrc :   '<% _.each(["defaultValue", "hint", "size"], function(el) { %>' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1"><%= el %></label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="<%= el %>" placeholder="<%= el %>" value="<%= eval(el) %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '<% }) %>'
    });


    
    //  ----------------------------------------------------------------------------------
    //  Pattern views
    
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
                        '       <div class="span8 right hide actions">'+
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
    
    app.views.PatternFieldEditView = Backbone.View.extend({
        
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },
        
        /**
         * Render Pattern field edition view, the view contains an text field edition view
         * 
         * @returns {PatternFieldEditView} current view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            
            var textView = new app.views.TextFieldEditView({
                el      : $('#subTextView'),
                model   : this.model
            });
            textView.render();
            
            return this;
        }
        
    }, {
        templateSrc :   '   <div id="subTextView"></div>' + 
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">Pattern</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="pattern" placeholder="Pattern" value="<%= pattern %>" />' +
                        '       </div>' +
                        '   </div>'
    });




    //  ----------------------------------------------------------------------------------
    //  File field views
    
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
                        '       <div class="span8 right hide actions">'+
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
     * File field edition view
     */
    app.views.FileFieldEditView = Backbone.View.extend({
        
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },
        
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        }
        
    }, {
        templateSrc :   '   <% _.each(["defaultValue", "file", "mimeType"], function(el) {%> '+
                        '       <div >' +
                        '           <div class="row-fluid">'+
                        '               <label class="span10 offset1"><%= el %></label>' +
                        '           </div>' +
                        '           <div class="row-fluid">' +
                        '               <input class="span10 offset1 property" type="text" data-attr="<%= el %>" placeholder="<%= el %>" value="<%= eval(el) %>" />' +
                        '           </div>' +
                        '       </div>' +
                        '   <% }); %>' +
                        '       <div >' +
                        '           <div class="row-fluid">'+
                        '               <label class="span10 offset1">File max size</label>' +
                        '           </div>' +
                        '           <div class="row-fluid">' +
                        '               <input class="span10 offset1 property" type="number" data-attr="size" placeholder="Max file size" value="<%= size %>" />' +
                        '           </div>' +
                        '       </div>' 
    });



    //  ----------------------------------------------------------------------------------
    //  Numeriv field views
    
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
                        '       <div class="span8 right hide actions">'+
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
     * Numeric field edition view
     */
    app.views.NumericFieldEditView = Backbone.View.extend({
        
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },
        
        /**
         * Render Pattern field edition view, the view contains an text field edition view
         * 
         * @returns {PatternFieldEditView} current view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            
            var textView = new app.views.TextFieldEditView({
                el      : $('#subTextView'),
                model   : this.model
            });
            textView.render();
            
            return this;
        }
        
    }, {
        templateSrc :   '   <div id="subTextView"></div>' + 
                        '   <% _.each(["minValue", "maxValue", "precision", "unity"], function(idx) { %>' +
                        '       <div >' +
                        '           <div class="row-fluid">'+
                        '               <label class="span10 offset1"><%= idx %></label>' +
                        '           </div>' +
                        '           <div class="row-fluid">' +
                        '               <input class="span10 offset1 property" type="text" data-attr="<%= idx %>" placeholder="<%= idx %>" value="<%= eval(idx) %>" />' +
                        '           </div>' +
                        '       </div>'+
                        '   <% }) %>'
    });



    //  ----------------------------------------------------------------------------------
    //  Date field views
    
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
                        '       <div class="span8 right hide actions">'+
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
     * Date field edition view
     */
    app.views.DateFieldEditView = Backbone.View.extend({
        
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },
        
        /**
         * Render Pattern field edition view, the view contains an text field edition view
         * 
         * @returns {PatternFieldEditView} current view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            
            var textView = new app.views.TextFieldEditView({
                el      : $('#subTextView'),
                model   : this.model
            });
            textView.render();
            
            return this;
        }
        
    }, {
        templateSrc :   '   <div id="subTextView"></div>' + 
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">Format</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="format" placeholder="Date format" value="<%= format %>" />' +
                        '       </div>' +
                        '   </div>'
    });



    //  ----------------------------------------------------------------------------------
    //  Long text views
    
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
                        '       <div class="span8 right hide actions">'+
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
    
    /**
     * Long text field edition view
     */
    app.views.LongTextFieldEditView = app.views.TextFieldEditView.extend({});



    //  ----------------------------------------------------------------------------------
    //  TreeView views
    
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
                        '       <div class="span8 right hide actions">'+
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
     * Tree view field edition view
     */
    app.views.TreeViewFieldEditView = Backbone.View.extend({
        
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
        },
        
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        }
        
    }, {
        templateSrc : ''
    });




    //  ----------------------------------------------------------------------------------
    //  Enumeration field view
    
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
                        '      <div class="span8 right hide actions">'+
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
                        '   <div class="span8 right hide actions">'+
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
                        '   <div class="span8 right hide actions">'+
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
     * Common edition view for enumeration field
     */
    app.views.RadioFieldEditView = app.views.CheckBoxFieldEditView = app.views.SelectFieldEditView = Backbone.View.extend({
        events: function() {
            return _.extend({}, app.views.BaseView.prototype.events, {
                'click .listEdit' : 'editList'
            });
        },
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'editList');
        },
        
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        },

        copyeItemList  : function() {
            return _.pick(this.model.get('itemList'), "items", "defaultValue");
        },
        
        editList : function(e) {
            var modal = new app.views.EditListModal({
                el      : '#editListModal',
                model   : this.copyeItemList()
            });
            modal.render();

            modal.bind('saved', _.bind(function() {
                this.model.set('itemList', modal.model);
                modal.unbind();
                delete modal;
                this.model.trigger('change');
            }, this))
        }
        
    }, {
        templateSrc:    '   <div class="row-fluid"><div class="block span10 offset1">' + 
                        '       <table class=" table table-striped">' +
                        '           <caption><h2>'+
                        '               Item list / Default value : <b><%= itemList["defaultValue"] %>  <i class="fa fa-wrench listEdit"></i>'+
                        '           </h2></caption>'+
                        '           <thead>' +
                        '               <tr>'+ 
                        '                   <th>Id</th>'+
                        '                   <th>Label en</th>'+
                        '                   <th>Label fr</th>'+
                        '                   <th>Value</th>'+
                        '               </tr>'+ 
                        '           </thead>' +
                        '           <tbody>' +
                        '               <% _.each( itemList["items"], function(item, idx) { %>' +
                        '                   <tr>' + 
                        '                       <td><%= item["id"] %></td>'+
                        '                       <td><%= item["en"] %></td>'+
                        '                       <td><%= item["fr"] %></td>'+
                        '                       <td><%= item["value"] %></td>' +
                        '                   </tr>' +
                        '               <% }); %>' +    
                        '           </tbody>'+
                        '       </table>' +
                        '   </div></div>'+
                        '   <div class="row-fluid">' + 
                        '       <label class="span10 offset1"></label>' +
                        '   </div>'    
    });
    
    app.views.EditListModal = Backbone.View.extend({

        events : {
            'click #addItem'                : 'addItem',
            'click .btn-primary'            : 'saveChanges',
            'change input[type="text"]'     : 'propertyChanged',
            'change input[type="radio"]'    : 'defaultValueChanged',
            'click td .close'               : 'removeItem',
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
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="value"]').addClass('error')
            } else {
                $(this.el).find('input[data-index="' + (index - 1) + '"][data-attr="value"]').removeClass('error')
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
                )
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

    //  ----------------------------------------------------------------------------------
    //  Main views
    
    /**
     * Main form view
     */
    app.views.FormView = Backbone.View.extend({
        
        events: {
            'change #protocolName' : 'changeFormName'
        },
        
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 
                            'addElement', 
                            'changeFormName', 
                            'importXML', 
                            'downloadXML', 
                            'updateView', 
                            'getModel',
                            'getXML'
                    );
            this.collection.bind('add', this.addElement);
            this.collection.bind('change', this.updateView);
            this._view = [];
        },
        
        updateView : function() {

            console.log (this.collection);
            var renderedContent = this.template(this.collection.toJSON());
            $(this.el).html(renderedContent);
            $(this.el).find('#protocolName').val(this.collection.name);
        },
        
        addElement: function(el) {
            var id = "dropField" + this.collection.length, viewClassName = el.constructor.type + "FieldView";
        
            $('.drop').append('<div class="span12 dropField " id="' + id  + '" ></div>');            
            
            if (app.views[viewClassName] !== undefined) {
                var vue = new app.views[viewClassName]({
                    el      : $("#" + id),
                    model   : el
                });
                if (vue !== null) {
                    vue.render();
                    this._view[id] = vue;
                }
            } else {
                new NS.UI.Notification({
                    type    : 'error',
                    title   : 'An error occured :',
                    message : "Can't create view for this field"
                });
            }
            $(".actions").i18n();
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
            });
            return this;
        },
        
        getModel : function() {
            return this.collection.length;
        },
        
        changeFormName: function() {
            this.collection.name = $('#protocolName').val();
        },
        
        downloadXML: function() {
            $( $(this.constructor.popupDwSrc) ).modal({
                
            }).on('click', '.btn-primary', _.bind(function() {
                
                $('#exportProtocolFileName')[ $('#exportProtocolFileName').val() === "" ? 'addClass' : 'removeClass']('error');
                
                if (!$('#exportProtocolFileName').hasClass('error')) {
                    try {
                        var isFileSaverSupported = !!new Blob();
                        var blob = new Blob(
                                [this.collection.getXML()],
                                {type: "application/xml;charset=utf-8"}
                        );
                        saveAs(blob, $('#exportProtocolFileName').val() + '.xml');
                        $('#exportProtocolModal').modal('hide').removeData();
                        new NS.UI.Notification({
                            type    : 'success',
                            title   : 'Protocol export :',
                            message : "XML file correctly created"
                        });
                    } catch (e) {
                        $('#exportProtocolModal').modal('hide').removeData();
                        new NS.UI.Notification({
                            type    : 'error',
                            title   : 'An error occured :',
                            message : "Can't create your XML file"
                        });
                    }
                }
            }, this));
        },
        
        getXML : function() {
            return this.collection.getXML();
        },
        
        
        importXML: function() {
            $( $(this.constructor.popupSrc) ).modal({
                
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
                                        new NS.UI.Notification({
                                            type    : 'error',
                                            title   : 'An error occured :',
                                            message : 'There is a error on the ' + result['element'] + '<br />' + result['message'] + '<br />Please check your XML file'
                                        });
                                    } else {
                                        this.collection.updateWithXml(evt.target.result, $('#importProtocolName').val());
                                        $('#importProtocolModal').modal('hide').removeData();
                                        new NS.UI.Notification({
                                            type    : 'success',
                                            title   : 'Porotocol imported :',
                                            message : 'Your protocol was correctly imported'
                                        });
                                    }
                                } catch (err) {
                                    $('#importProtocolModal').modal('hide').removeData();
                                    new NS.UI.Notification({
                                        type    : 'error',
                                        title   : 'An error occured :',
                                        message : "Your XML File can't be validated.<br />The specific error is : " + err
                                    });
                                }
                            }, this);
                            reader.onerror = function(evt) {
                                $('#importProtocolModal').modal('hide').removeData();
                                new NS.UI.Notification({
                                    type    : 'error',
                                    title   : 'An error occured :',
                                    message : "An error was occure during reading file"
                                });
                            };
                        } else {
                            $('#importProtocolModal').modal('hide').removeData();
                            new NS.UI.Notification({
                                type    : 'error',
                                title   : 'File type error :',
                                message : "Your have to give an XML file."
                            });
                        }
                    } else {
                        $('#importProtocolModal').modal('hide').removeData();
                        new NS.UI.Notification({
                            type    : 'error',
                            title   : 'File type error :',
                            message : "An error was occure during reading file."
                        });
                    }                    
                }
                
            }, this)).find('#formName').typeahead({
                source: function(query, process) {
                    return $.getJSON('/protocols', {query : query}, function(data) {
                        return process(data.options);
                    });
                }
            });
        }
    }, {
        templateSrc:    '<div class="row-fluid notification-container"><ul class="notification-list span12"></ul></div>'+
                        '<div class="row-fluid">'+
                            '<input type="text" id="protocolName" class="firstText span12" value="<%= this.collection.name %>" />'+
                        '</div>'+
                        '<div class="row-fluid"><h2 class="center" data-i18n="label.help">Cliquer sur champs pour l\'ajouter au protocole</h2></div>'+
                        '<div class="row-fluid">'+
                            '<div class="span12 drop"></div>'+
                        '</div>',

        popupSrc:   '<div class="modal hide fade" id="importProtocolModal">'+
                    '   <div class="modal-header">'+
                    '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                    '       <h3>Import protocol</h3>'+
                    '   </div>'+
                    '   <div class="modal-body">'+
                    '       <div class="row-fluid">'+
                    '           <label>Enter a protocol name and import your file</label>'+
                    '       </div>'+
                    '       <div class="row-fluid">'+
                    '           <input type="text" id="importProtocolName" class="span12" placeholder="Protocol name" data-provide="typeahead" />'+
                    '       </div><br />'+
                    '       <div class="row-fluid">'+
                    '           <input type="file" id="importProtocolFile" class="hide" />'+
                    '           <input type="text" id="importProtocolFileText" class="span10" placeholder="Protocol file" style="margin-left : 0" />'+
                    '           <button type="button" class="span2" id="importProtocolFind">Find</button>'+
                    '       </div>'+
                    '   </div>'+
                    '   <div class="modal-footer">'+
                    '       <a href="#" class="btn btn-primary">Import</a>'+
                    '   </div>'+
                    '</div>',

        popupDwSrc: '<div id="exportProtocolModal" class="modal hide fade">'+
                    '   <div class="modal-header">'+
                    '       <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>'+
                    '       <h3>Protocol export</h3>'+
                    '   </div>'+
                    '   <div class="modal-body">'+
                    '       <div class="row-fluid">'+
                    '           <label>Enter a name for XML File</label>'+
                    '       </div>'+
                    '       <div class="row-fluid">'+
                    '           <input type="text" class="span12" id="exportProtocolFileName" placeholder="Your XML filename" />'+
                    '       </div>'+
                    '   </div>'+
                    '   <div class="modal-footer">'+
                    '       <a href="#" class="btn btn-primary">Import</a>'+
                    '   </div>'+
                    '</div>'
    });


    /**
     * Panel view
     */
    app.views.PanelView = Backbone.View.extend({
        events: {
            'click .fields': 'appendToDrop'
        },
        initialize: function(collection) {
            this._collection = collection;
            _.bindAll(this, 'appendToDrop');
        },
        appendToDrop : function(e) {
            
            var elementClassName = $(e.target).data("type") + 'Field';
            
            if (app.models[elementClassName] !== undefined) {
                
                var f = new app.models[elementClassName]({
                    id: this.collection.getSize()
                });
                
                this.collection.add(f);
            } else {
                new NS.UI.Notification({
                    type    : 'error',
                    title   : 'An error occured :',
                    message : "Can't create field object"
                });
            }            
        },
        render: function() {            
            var renderedContent = _.template(this.constructor.templateSrc);
            $(this.el).html(renderedContent);
            $(this.el).nanoScroller();

            return this;
        }
    }, {
        templateSrc :   '<div class="nano-content">'+
                            '<h1 class="center" data-i18n="label.field"></h1>' +
                            '<%  _.each(formBuilder.models, function(el, idx) { %>' + 
                            '   <% if (el.type != undefined) { %>' + 
                            '       <div class="row-fluid">' +
                            '           <div class="span10 offset1 fields" data-type="<%= idx.replace("Field", "") %>" data-i18n="fields.<%= el["i18n"] %>" >' +
                            '               <%= el["i18n"] %>'+
                            '           </div>' +
                            '       </div>' +
                            '   <% } %>' +
                            ' <%}); %>'+
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
                        '   <div class="span8 right hide actions">'+
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
                        '   <div class="span8 right hide actions">'+
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
    

    //  ----------------------------------------------------------------------------------
    //  Modal view
    
    app.views.SaveProtocolModalView = Backbone.View.extend({
        
        events : {
            'keyup #saveProtocolKeywords'               : 'validateProtocolValue',
            'click #saveProtocolKeywordsList .close'    : 'removeKeyword',
            'click .btn-primary'                        : 'validateProtocolSave',
        },
        
        initialize : function(options) {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 
                'render', 
                'validateProtocolValue', 
                'removeKeyword', 
                'appendKeywordValue'
            );
            
            this.keywordList = [];
        },
        
        render : function() {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            $(this.el).modal({ show: true });
            
            //  ----------------------------------------------------------
            
            $(this.el).find('#saveProtocolName').typeahead({
                source: function(query, process) {
                    return $.getJSON('/protocols', {query: query}, function(data) {
                        return process(data.options);
                    });
                }
            });
            
            $(this.el).find('#saveProtocolKeywords').typeahead({
                source: function(query, process) {
                    return $.getJSON('/keywords', {query: query}, function(data) {
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
    
    app.views.DiffProtocolModalView = Backbone.View.extend({
        
        events : {
            'click .btn-primary' : 'showDiff',
            'click #findSource, #findUpdate' : 'triggerInputFile',
            'change input[type="file"]' : 'inputFileValueChange'
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
    
    app.views.MainView = Backbone.View.extend({
        
        initialize : function(options) {
            this.el = options.el;
            $(this.el).append(
                '<div class="row-fluid content">'+
                '   <div class="span3 widgetsPanel nano"></div>'+
                '   <div class="span9 dropArea"></div>'+
                '   <div class="span5 settings"></div>'+
                '</div>'
            );
            
            this.form = options.form || new app.views.Form({}, {
                name: "My form"
            });

            this.panelView = new app.views.PanelView({
                el: $('.widgetsPanel'),
                collection: this.form,
            });

            this.formView = new app.views.FormView({
                collection: this.form,
                el: $('.dropArea')
            });            
            
            this.panelView.render();
            this.formView.render();
            
            _.bindAll(this, 'getFormXML', 'downloadXML', 'importXML', 'getActions');
        },
        
        clear: function() {
            this.form.clearAll();
        },
        
        getFormXML : function() {
            return this.formView.getXML();
        },
        
        downloadXML : function() {
            return this.formView.downloadXML();
        },
        
        importXML : function() {
            return this.formView.importXML();
        },
        
        getActions : function() {
            return {
                save : new NS.UI.NavBar.Action({
                    title           : '<i class="fa fa-cloud"></i><span data-i18n="nav.save.title">Save protocol</span>',
                    allowedRoles    : ["reader"],
                    actions: {
                        'save.repo' : new NS.UI.NavBar.Action({
                            //  Display modal window for save the protocol in the repository
                            title       : '<span data-i18n="nav.save.cloud"></span>',
                            allowedRoles: ['reader'],                    
                            handler: function() {
                                var modalView = new app.views.SaveProtocolModalView({el: '#saveModal'});
                                modalView.render();
                            }
                        }),
                        'save.xport': new NS.UI.NavBar.Action({
                            //  Allow to export protocol as a XML file
                            handler: function() {
                                app.instances.mainView.downloadXML();
                            },
                            allowedRoles    : ["reader"],
                            title           : 'Export as XML'
                        })
                    }
                }),
                
                'import' : new NS.UI.NavBar.Action({
                    actions : {
                        'import.XML' : new NS.UI.NavBar.Action({
                            handler: function() {
                                app.instances.mainView.importXML();
                            },
                            allowedRoles: ["reader"],
                            title       : 'Importer un fichier XML'
                        }),
                        'import.load' : new NS.UI.NavBar.Action({
                            title       : 'Charger depuis le serveur',
                            allowedRoles: ["reader"],
                            handler : function () {
                                alert ('I\'m working on it !');
                            }
                        })
                    },
                    title       : '<span class="fa fa-upload" data-i18n="nav.import.title"></span>',
                    allowedRoles: ["reader"]
                }),
                
                clear: new NS.UI.NavBar.Action({
                    handler: function() {
                        app.instances.mainView.clear();
                    },
                    allowedRoles: ["reader"],
                    title       : '<i class="fa fa-trash-o"></i> Tout supprimer'
                }),
                
                show: new NS.UI.NavBar.Action({
                    handler: function() {
                        $('#compareModal').modal('show')
                        .on('click', '#findSource, #findUpdate', function() {
                            $('#' + $(this).prop('id').replace('find', '').toLowerCase() + 'Hide').trigger('click');
                        })
                        .on('change', 'input[type="file"]', function() {
                            var id = $(this).prop('id').replace('Hide', ''), split = $(this).val().split('\\');
                            $('#' + id).val(split[ split.length - 1]);
                        })
                        .on('click', '.btn-primary', function() {
                            $('#compareModal').modal('hide');
                            var source  = $('#compareModal').find('#sourceHide')[0].files[0],
                                update  = $('#compareModal').find('#updateHide')[0].files[0], 
                                srcName = source['name'], 
                                updName = update['name'],
                                reader  = null;

                            if (source !== null && update !== null) {
                                 if (source.type === "text/xml" && update.type === "text/xml") {
                                    reader = new FileReader();
                                    reader.readAsText(source, "UTF-8");
                                    reader.onload = function(evt) {
                                        try {
                                            if (formBuilder.XMLValidation(evt.target.result) !== true) {
                                                new NS.UI.Notification ({
                                                    title : result.error,
                                                    type : 'error',
                                                    message : 'Your XML don\'t matches with XML Schema'
                                                });
                                            } else {
                                                source = evt.target.result;
                                                reader = new FileReader();
                                                reader.readAsText(update, "UTF-8");
                                                reader.onload = function(evt) {
                                                    if (formBuilder.XMLValidation(evt.target.result) === true) {
                                                        update = evt.target.result;
                                                        $('.widgetsPanel').switchClass('span3', 'span0', 250, function() {
                                                            $('.dropArea').append(
                                                                formBuilder.GetXMLDiff(source, update, srcName, updName)
                                                            ).switchClass('span9', 'span12', 250).find('.diff').addClass('span11');
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
                                                        })
                                                    }
                                                };
                                            }
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

                                } else {
                                    new NS.UI.Notification({
                                        type: 'error',
                                        title: "File mime type error",
                                        message: 'You must choose only XML files'
                                    });
                                }
                            } else {
                                new NS.UI.Notification({
                                    type: 'error',
                                    title: "Reading error",
                                    message: 'Error durring XML loading ! '
                                });
                            }
                        }).removeClass('hide').css('width', '700px');
                    },
                    allowedRoles: ["reader"],
                    title: '<span class="fa fa-bars" data-i18n="nav.compare"></span>'
                })        
            };
        }
    });
    
    return app;
    
})(formBuilder);
