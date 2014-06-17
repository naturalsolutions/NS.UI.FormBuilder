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

//
    //  ----------------------------------------------------------------------------------
    //  Base views
    
    /**
     * It's the basic views for all field view.
     */
    formBuild.BaseView = Backbone.View.extend({
        
        /**
         * Events for the intercepted by the view
         */
        events: {
            'click  .trash'         : 'removeView',
            'click .wrench'         : 'setting',
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
            _.bindAll(this, 'render', 'removeView', 'setting', 'updateSetting', 'deleteView');
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
            console.log ("ici")
            $(e.delegateTarget).find('.right').removeClass('hide');
        },
        
        /**
         * Copy model of this view
         */
        copyModel : function() {
            var cl = this.model.clone();
            cl.set('id', formBuild.mainView.formView.collection.length);    //  change id otherwise element replaced copied element
            formBuild.mainView.formView.collection.add(cl);                 //  Add element to the collection
        },
        
        /**
         * Display edition view for model
         */
        setting: function() {
            if ($('.dropArea').hasClass('span9')) {
                var edit = new formBuild.BaseEditView({
                    el: $('.settings'),
                    model : this.model
                });
                $('.dropArea').switchClass('span9', 'span7', 500);
                $('.widgetsPanel').switchClass('span3', 'span0', 500);
                edit.render();
            }
        },
        
        /**
         * Remove view
         */
        removeView: function() {
            this.model.set('state', 'delete');
            $(this.el).remove();
            this.remove();
        },
        
        /**
         * Render view 
         * 
         * @returns {formBuild.BaseView} view
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
        
        /**
         * Update setting view
         */
        updateSetting : function() {
            if (!$('.dropArea').hasClass('span9')) {
                formBuild.set = new formBuild.SettingView({
                    model: this.model,
                    el: $('.settings')
                }).render();
            }
        }
        
    });
    
    /**
     * Basic edition view for all field edition view
     */
    formBuild.BaseEditView = Backbone.View.extend({
        
        /**
         * Evenet intercepted by the view
         */
        events : {
            'click .close'                  : 'hidePanel',
            'click h2 > a:not(.selected)'   : 'displayOptions',
            'change .property'              : 'updateModel'
        },
        
        /**
         * Constructor
         */
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'updateModel');
            this.model.bind('change', this.render);
            this.model.bind('destroy', this.deleteView);
        },
        
        /**
         * Hide panel edition and remove edition view
         */
        hidePanel: function() {
            if ($('.dropArea').hasClass('span7')) {
                $('.dropArea').switchClass('span7', 'span9', 100);
                $('.widgetsPanel').switchClass('span0', 'span3', 200, _.bind(function() {
                    $(this.el).remove();
                    this.remove();
                }, this));
            }
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
        updateModel: function(e) {
            //  this.model.changePropertyValue($(e.target).data('attr'), $(e.target).is(':checked'));
            this.model.changePropertyValue($(e.target).data('attr'), $(e.target).val());
        },
        

        /**
         * Render view 
         * 
         * @returns {formBuild.BaseView} view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            
            //  subView
            var subView = new formBuild[this.model.constructor.type + 'FieldEditView']({
               el : $('#subView') ,
               model : this.model
            });
            subView.render();
            
            return this;
        }
    
    }, {
        templateSrc : '<div>'+
                        '   <h1>Settings</h1>'+
                        '   <div>'+
                        '       <h2>'+
                        '           <a href="#" id="simple" class="selected">Simple options</a> / <a href="#" id="advanced">Advanced options</a>'+
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
                        '           <input class="span10 offset1 property" type="text" data-attr="name/label/value" placeholder="Name label" value="<%= name["label"]["value"] %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '   <div >' +
                        '       <div class="row-fluid">'+
                        '           <label class="span10 offset1">Name label lang</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="name/label/lang" placeholder="Name label lang" value="<%= name["label"]["lang"] %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        '   <div class="row-fluid">&nbsp;</div><div class="row-fluid">' +
                        '       <label class="span4 offset1">Required</label>' +
                        '           <input class="span2 property" data-attr="required" type="checkbox" <% if (required) { %> checked <% } %> />' +
                        '   </div>' +
                        '   <div class="row-fluid">&nbsp;</div><div class="row-fluid">' +
                        '       <label class="span4 offset1">Read only</label>' +
                        '           <input class="span2 property" data-attr="readOnly" type="checkbox" <% if (readOnly) { %> checked <% } %> />' +
                        '   </div>' +
                        //  end
                        '       <div id="subView"></div>' +
                        '       <div class="row-fluid">&nbsp;</div>'+
                        '   </div>' +
                        '   <div class="row-fluid">&nbsp;</div>'+
                        '   <button class="close center" style="width: 100%">Save</button>'+
                        '</div>'
    }); 
    
    
    
    //  ----------------------------------------------------------------------------------
    //  TextField views
    
    /**
     * View for text field element
     */
    formBuild.TextFieldView = formBuild.BaseView.extend({
        
        /**
         * Get BaseView events and add sepecific TextFieldView event
         */
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },
        
        /**
         * Render view
         */
        render : function() {
           formBuild.BaseView.prototype.render.apply(this, arguments);
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
                        '   <div class="span8 right hide">'+
                        '       <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '       <a href="#" class="wrench"><i class="fa fa-wrench"></i>Modifier</a>'+ 
                        '       <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
                        '   </div>'+
                        '</div>' +
                        '<div class="row" style="margin-left : 10px;">' + 
                        '   <input type="text" class="span12" name="<%= name %>" id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" /> '+
                        '</div></div>'
    });

    formBuild.TextFieldEditView = Backbone.View.extend({
        
        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },
        
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        }
        
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
    formBuild.PatternFieldView = formBuild.BaseView.extend({
        
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change input[type="text"]': 'updateModel'
            });
        },
        
        initialize : function() {
          formBuild.BaseView.prototype.initialize.apply(this, arguments);
        },
        
        render: function() {
            formBuild.BaseView.prototype.render.apply(this, arguments);
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
                        '       <div class="span8 right hide">'+
                        '           <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '           <a href="#" class="wrench"><i class="fa fa-wrench"></i>Modifier</a>'+ 
                        '           <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
                        '       </div>'+
                        '   </div>' +
                        '   <div class="row" style="margin-left : 10px;">' + 
                        '       <input type="text" class="span12" name="<%= name %>" id="<%= id%>" placeholder="<%= hint %>" value="<%= defaultValue %>" pattern="<%= pattern %>" /> '+
                        '   </div>'+
                        '</div>'
    });
    
    formBuild.PatternFieldEditView = Backbone.View.extend({
        
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
            
            var textView = new formBuild.TextFieldEditView({
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
    formBuild.FileFieldView = formBuild.BaseView.extend({
        
        /**
         * Events of the view
         */
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
                'change input[type="text"]'     : 'updateModel',
                'click input[type="submit"]'    : 'triggerFile',
                'click input[type="text"]'      : 'triggerFile',
                'change input[type="file"]'     : 'fileChange'
            });
        },
        
        initialize : function() {
          formBuild.BaseView.prototype.initialize.apply(this, arguments);
        },
        
        triggerFile : function() {
            $(this.el).find('input[type="file"]').trigger('click');
        },
        
        render: function() {
            formBuild.BaseView.prototype.render.apply(this, arguments);
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
                        '       <div class="span8 right hide">'+
                        '           <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '           <a href="#" class="wrench"><i class="fa fa-wrench"></i>Modifier</a>'+ 
                        '           <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
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
    formBuild.FileFieldEditView = Backbone.View.extend({
        
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
    formBuild.NumericFieldView = formBuild.BaseView.extend({
        
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
            });
        },
        
        render: function() {
            formBuild.BaseView.prototype.render.apply(this, arguments);
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
                        '       <div class="span8 right hide">'+
                        '           <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '           <a href="#" class="wrench"><i class="fa fa-wrench"></i>Modifier</a>'+ 
                        '           <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
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
    formBuild.NumericFieldEditView = Backbone.View.extend({
        
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
            
            var textView = new formBuild.TextFieldEditView({
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
        templateSrc:    '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' + 
                        '       <label class="span4">' + 
                        '           <i class="fa fa-arrows" style="color : #09C"></i>' + 
                        '           <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '       <div class="span8 right hide">'+
                        '           <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '           <a href="#" class="wrench"><i class="fa fa-wrench"></i>Modifier</a>'+ 
                        '           <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
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
    formBuild.DateFieldEditView = Backbone.View.extend({
        
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
            
            var textView = new formBuild.TextFieldEditView({
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
        templateSrc:    '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' + 
                        '       <label class="span4">' + 
                        '           <i class="fa fa-arrows" style="color : #09C"></i>' + 
                        '           <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '       <div class="span8 right hide">'+
                        '           <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '           <a href="#" class="wrench"><i class="fa fa-wrench"></i>Modifier</a>'+ 
                        '           <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
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
    formBuild.LongTextFieldEditView = formBuild.TextFieldEditView.extend({});



    //  ----------------------------------------------------------------------------------
    //  TreeView views
    
    //  FIX edition view
    
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
        templateSrc:    '<div class="element">'+
                        '   <div class="row" style="margin-left : 10px;">' + 
                        '       <label class="span4">' + 
                        '           <i class="fa fa-arrows" style="color : #09C"></i>' + 
                        '           <% if (required === true) { %> * <% } %> <%= label %>'+
                        '       </label> '+
                        '       <div class="span8 right hide">'+
                        '           <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '           <a href="#" class="wrench"><i class="fa fa-wrench"></i>Modifier</a>'+ 
                        '           <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
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
    formBuild.TreeViewFieldEditView = Backbone.View.extend({
        
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
    formBuild.RadioFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {
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
                        '      <div class="span8 right hide">'+
                        '          <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '          <a href="#" class="wrench"><i class="fa fa-wrench"></i>Modifier</a>'+ 
                        '          <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
                        '      </div>'+
                        '   </div>'+
                        '   <div class="row" style="margin-left : 10px;">' + 
                        '      <div class="span12" style="border : 2px #eee solid;" id="<%= id %>">'+
                        '          <% _.each(items[0]["items"], function(el, index) { %>' +
                        '              <label class="span12 noMarginLeft left"> '+
                        '              <input type="radio" style="margin-left: 10px;" name="<%= name %>" <% if (items[0]["defaultValue"] == el["id"]){ %> checked <% } %> value="<%= el.value %>"  /> '+
                        '                  <%= el.label %>'+
                        '              </label> '+
                        '          <% }); %>'+
                        '      </div>'+
                        '   </div>'    +
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
        templateSrc:    '<div class="element"><div class="row" style="margin-left : 10px;">' + 
                        '   <label class="span4">' + 
                        '       <i class="fa fa-arrows" style="color : #09C"></i>' + 
                        '       <% if (required === true) { %> * <% } %> <%= label %></label> '+
                        '   <div class="span8 right hide">'+
                        '       <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '       <a href="#" class="wrench"><i class="fa fa-wrench"></i>Modifier</a>'+ 
                        '       <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
                        '   </div>'+
                        '</div>' +
                        '<div class="row" style="margin-left : 10px;">' + 
                        '   <select name="<% name %>" class="span12"> '+
                        '       <% _.each(items[0]["items"], function(el, idx) { %>' +
                        '           <option data-idx=<%= idx %> value="<%= el.value %>" <% if (items[0]["defaultValue"] == el["id"]){ %> selected <% } %> ><%= el.label %></option>'+
                        '       <% }) %>' +
                        '   </select> '+
                        '</div></div>'
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
        templateSrc:    '<div class="element">'+
                        '<div class="row" style="margin-left : 10px;">' + 
                        '   <label class="span4">' + 
                        '       <i class="fa fa-arrows" style="color : #09C"></i>' + 
                        '       <% if (required === true) { %> * <% } %> <%= label %>'+
                        '   </label>'+
                        '   <div class="span8 right hide">'+
                        '       <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '       <a href="#" class="wrench"><i class="fa fa-wrench"></i>Modifier</a>'+ 
                        '       <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
                        '   </div>'+
                        '</div>'+
                        '<div class="row" style="margin-left : 10px;">' + 
                        '<div class="span12" style="border : 2px #eee solid;">'+
                            '<% _.each(items[0]["items"], function(el, idx) { %>' +
                                '<label class="span12 noMarginLeft left"> '+
                                    '<input data-idx=<%= idx %> type="checkbox" style="margin-left: 10px;" name="<%= name %>" id="<%= id %>" value="<%= el.value%>" <% if (items[0]["defaultValue"] == el["id"]){ %> checked <% } %> /> '+
                                    '<%= el.label %>'+
                                '</label> '+
                            '<% }); %>'+
                        '</div>'+
                        '</div>' + 
                        '</div>'
    });

    /**
     * Common edition view for enumeration field
     */
    formBuild.RadioFieldEditView = formBuild.CheckboxFieldEditView = formBuild.SelectFieldEditView = Backbone.View.extend({
        initialize: function() {
            this.template = _.template(this.constructor.templateSrc);
        },
        
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        }
        
    }, {
        templateSrc:    '<% _.each( items, function(list, index) { %>' +
                        '   <div class="row-fluid"><div class="block span10 offset1">' + 
                        '       <table class=" table table-striped">' +
                        '           <caption><h2>'+
                        '               <%= list["lang"] %> list / Default value : <b><%= list["defaultValue"] %>'+
                        '           </h2></caption>'+
                        '           <thead>' +
                        '               <tr>'+ 
                        '                   <th>Id</th>'+
                        '                   <th>Label</th>'+
                        '                   <th>Value</th>'+
                        '               </tr>'+ 
                        '           </thead>' +
                        '           <tbody>' +
                        '               <% _.each( list["items"], function(item, idx) { %>' +
                        '                   <tr>' + 
                        '                       <td><%= item["id"] %></td>'+
                        '                       <td><%= item["label"] %></td>'+
                        '                       <td><%= item["value"] %></td>' +
                        '                   </tr>' +
                        '               <% }); %>' +    
                        '           </tbody>'+
                        '       </table>' +
                        '   </div></div>'+
                        '   <div class="row-fluid">' + 
                        '       <label class="span10 offset1"></label>' +
                        '   </div>'+
                        '<% }); %>'        
    });
    

    //  ----------------------------------------------------------------------------------
    //  Main views
    
    /**
     * Main form view
     */
    formBuild.FormView = Backbone.View.extend({
        
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
                new NS.UI.Notification({
                    type    : 'error',
                    title   : 'An error occured :',
                    message : "Can't create view for this field"
                });
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
                                    var result = formBuild.XMLValidation(evt.target.result);
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
                        '<div class="row-fluid"><h2 class="center">Click on a field to add it in the aera</h2></div>'+
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
    formBuild.PanelView = Backbone.View.extend({
        events: {
            'click .fields': 'appendToDrop'
        },
        initialize: function(collection) {
            this._collection = collection;
            _.bindAll(this, 'appendToDrop');
        },
        appendToDrop : function(e) {
            
            if (formBuild[$(e.target).data("type") + 'Field'] !== undefined) {
                
                var f = new formBuild[$(e.target).data("type") + 'Field']({
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
                            '<h1 class="center">Fields</h1>' +
                            '<% _.each(formBuilder, function(el, idx) { %>' + 
                            '   <% if (el.type != undefined) { %>' + 
                            '       <div class="row-fluid">' +
                            '           <div class="span10 offset1 fields" data-type="<%= idx.replace("Field", "") %>">' +
                            '               <%= idx.replace("Field", " Field") %>' +
                            '           </div>' +
                            '       </div>' +
                            '   <% } %>' +
                            ' <%}); %>'+
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
        templateSrc :   '<div class="element"><div class="row" style="margin-left : 10px;">' + 
                        '   <label class="span4">' + 
                        '       <i class="fa fa-arrows" style="color : #09C"></i>' + 
                        '       &nbsp;</label> '+
                        '   <div class="span8 right hide">'+
                        '       <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '       <a href="#" class="wrench"><i class="fa fa-wrench"></i>Modifier</a>'+ 
                        '       <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
                        '   </div>'+
                        '</div>' +
                        '<div class="row" style="margin-left : 10px;">' + 
                        '   <input type="text"  class="span12" name="<%= name %>" id="<%= id%>" value="<%= value %>" disabled="disabled" /> '+
                        '</div></div>'
    });
    
    /**
     * Display an horizontal line in the form
     */
    formBuild.HorizontalLineFieldView = formBuild.BaseView.extend({
        events: function() {
            return _.extend({}, formBuild.BaseView.prototype.events, {});
        },
        render : function() {
            formBuild.BaseView.prototype.render.apply(this, arguments);
        }
    }, {
        templateSrc:    '<div class="element"><div class="row" style="margin-left : 10px;">' + 
                        '   <label class="span4">' + 
                        '       <i class="fa fa-arrows" style="color : #09C"></i>' + 
                        '       &nbsp;</label> '+
                        '   <div class="span8 right hide">'+
                        '       <a href="#" class="trash"><i class="fa fa-trash-o"></i>Supprimer</a>'+ 
                        '       <a href="#" class="copy">&nbsp;<i class="fa fa-copy"></i> Dupliquer</a>'+
                        '   </div>'+
                        '</div>' +
                        '<div class="row" style="margin-left : 10px;">' + 
                        '   <hr class="span12" />' +
                        '</div></div>'
    });
    

    return formBuild;
})(formBuilder);
