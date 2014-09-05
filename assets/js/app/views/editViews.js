/**
 * @fileOverview editViews.js
 *
 * Describe all edition views, each field model has a specific edition view
 *
 * @author          MICELI Antoine (miceli.antoine@gmail.com)
 * @version         1.0
 */

define(['backbone'], function(Backbone) {

    var editionViews = {};

	/**
     * Basic edition view for all field edition view
     */
    editionViews.BaseEditView = Backbone.View.extend({

        /**
         * Evenet intercepted by the view
         */
        events : {
            'click h2 > span:not(.selected)'   : 'displayOptions',
            'change .property'                 : 'updateModelAttribute'
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
            $(".settings h2 > span").toggleClass('selected');
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
         * @returns {editionViews.BaseView} view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);

            this.subView = new editionViews[this.model.constructor.type + 'FieldEditView']({
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
            $(this.el).unbind();
            $(this.subView.el).unbind();;

            this.model = newModel;
            this.model.bind('change', this.render);
            this.model.trigger('change');
        },

        /**
         * [getActions description]
         * @return {[type]}
         */
        getActions : function() {
            return {
                'save' : new NS.UI.NavBar.Action({
                    handler : function() {
                        if ($('.dropArea').hasClass('span7')) {
                            $('.dropArea').switchClass('span7', 'span9', 100);
                            $('.widgetsPanel').switchClass('span0', 'span3', 200);
                            window.location.hash = "#";
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
                        '           <span id="simple" class="selected" data-i18n="label.options.simple">Simple options</span> / '+
                        '           <span href="#" id="advanced" data-i18n="label.options.advanced" >Advanced options</span>'+
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

    editionViews.SimpleEditView = Backbone.View.extend({

        events : {
            'click h2 > span:not(.selected)'   : 'displayOptions',
            'change .property'                 : 'updateModelAttribute'
        },

        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'updateModelAttribute', 'changeModel');
            this.model.bind('change', this.render);
        },


        displayOptions: function(e) {
            $(".settings h2 > span").toggleClass('selected');
            if ($(e.target).prop('id') === "simple") {
                $('.advanced').addClass('hide', 500);
            } else {
                $('.advanced').removeClass('hide', 500);
            }
        },


        updateModelAttribute: function(e) {
            if ($(e.target).prop("type") === "checkbox") {
                this.model.changePropertyValue($(e.target).data('attr'), $(e.target).is(':checked'));
            } else {
                this.model.changePropertyValue($(e.target).data('attr'), $(e.target).val());
            }
        },

        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            $(this.el).i18n();
            //  Animate panel
            $('.dropArea').switchClass('span9', 'span7', 500);
            $('.widgetsPanel').switchClass('span3', 'span0', 500);
            return this;
        },

        changeModel : function(newModel) {
            $(this.el).unbind();
            $(this.subView.el).unbind();;

            this.model = newModel;
            this.model.bind('change', this.render);
            this.model.trigger('change');
        },

        getActions : function() {
            return editionViews.BaseEditView.prototype.getActions.apply(this, arguments);
        }

    });

    editionViews.HiddenFieldEditView = editionViews.SimpleEditView.extend({
    }, {
        templateSrc : '<div>'+
                        '   <h1 data-i18n="label.settings">Settings</h1>'+
                        '   <div>'+
                        '       <h2>'+
                        '           <span id="simple" class="selected" data-i18n="label.options.simple">Simple options</span> / '+
                        '           <span href="#" id="advanced" data-i18n="label.options.advanced" >Advanced options</span>'+
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
                        '           <label class="span10 offset1">Value</label>' +
                        '       </div>' +
                        '       <div class="row-fluid">' +
                        '           <input class="span10 offset1 property" type="text" data-attr="value" placeholder="Value" value="<%= value %>" />' +
                        '       </div>' +
                        '   </div> ' +
                        //  end
                        '   </div>' +
                        '   <div class="row-fluid">&nbsp;</div>'+
                        '</div>'
    });

	editionViews.AutocompleteFieldEditView = Backbone.View.extend({

        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
        },

        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        },

    }, {
        templateSrc :   '<% _.each(["defaultValue", "hint", "url"], function(el) { %>' +
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

    editionViews.TextFieldEditView = Backbone.View.extend({

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


    editionViews.PatternFieldEditView = Backbone.View.extend({

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

            var textView = new editionViews.TextFieldEditView({
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

    /**
     * File field edition view
     */
    editionViews.FileFieldEditView = Backbone.View.extend({

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

    /**
     * Numeric field edition view
     */
    editionViews.NumericFieldEditView = Backbone.View.extend({

        events : {
            'change select' : 'changed'
        },

        initialize: function() {
            this.template   = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'render', 'changed')
            this.model.bind('change', this.render)
        },

        /**
         * Render Pattern field edition view, the view contains an text field edition view
         *
         * @returns {PatternFieldEditView} current view
         */
        render: function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);

            var textView = new editionViews.TextFieldEditView({
                el      : $('#subTextView'),
                model   : this.model
            });
            textView.render();
            require(['app/formbuilder'], _.bind(function(formbuilderRef) {

                $.getJSON(formbuilderRef.URLOptions.unitURL, _.bind(function(data) {
                    var isSelected = value = null;

                    for (var op in data['options']) {
                        isSelected = this.model.get('unity') == data['options'][op] ? 'selected' : '';
                        value      = data['options'][op];
                        $(this.el).find('select').append('<option value="' + value + '"' + isSelected + '>' + value + '</option>');
                    }

                }, this));

            }, this));

            return this;
        },

        changed : function(e) {
            this.model.set('unity', $(e.target).val());
        }

    }, {
        templateSrc :   '   <div id="subTextView"></div>' +
                        '   <% _.each(["minValue", "maxValue", "precision"], function(idx) { %>' +
                        '       <div >' +
                        '           <div class="row-fluid">'+
                        '               <label class="span10 offset1"><%= idx %></label>' +
                        '           </div>' +
                        '           <div class="row-fluid">' +
                        '               <input class="span10 offset1 property" type="text" data-attr="<%= idx %>" placeholder="<%= idx %>" value="<%= eval(idx) %>" />' +
                        '           </div>' +
                        '       </div>'+
                        '   <% }) %>' + 
                        '       <div >' +
                        '           <div class="row-fluid">'+
                        '               <label class="span10 offset1">Unit</label>' +
                        '           </div>' +
                        '           <div class="row-fluid">' +
                        '               <select class="span10 offset1 property" type="text" data-attr="unity" placeholder="unit">' +
                        '               </select>' +
                        '           </div>' +
                        '       </div>'
    });

    /**
     * Date field edition view
     */
    editionViews.DateFieldEditView = Backbone.View.extend({

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

            var textView = new editionViews.TextFieldEditView({
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

    /**
     * Long text field edition view
     */
    editionViews.LongTextFieldEditView = editionViews.TextFieldEditView.extend({});

    /**
     * Tree view field edition view
     */
    editionViews.TreeViewFieldEditView = Backbone.View.extend({

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

    /**
     * Common edition view for enumeration field
     */
    editionViews.RadioFieldEditView = editionViews.CheckBoxFieldEditView = editionViews.SelectFieldEditView = Backbone.View.extend({
        events: function() {
            return _.extend({}, editionViews.BaseEditView.prototype.events, {
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
            require(['app/views/modal'], _.bind(function(modalViews) {
                var modal = new modalViews.EditListModal({
                    el      : '#editListModal',
                    model   : this.copyeItemList()
                });
                modal.render();

                modal.bind('saved', _.bind(function() {
                    this.model.set('itemList', modal.model);
                    modal.unbind();
                    delete modal;
                    this.model.trigger('change');
                }, this));
            }, this));
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


    editionViews.TableFieldEditView = Backbone.View.extend({
        events : {
        	'change .positionOption' : 'optionChanged'
        },

        initialize : function() {
            this.template = _.template(this.constructor.templateSrc);
            _.bindAll(this, 'optionChanged');
            this.model.bind('change', this.render);
            this.model.bind('done', _.bind(function() { this.render(); }, this));
        },

        render : function() {
            var renderedContent = this.template(this.model.toJSON());
            $(this.el).html(renderedContent);
            return this;
        },

        optionChanged : function(e) {
            var currentViewIndex    = $(e.target).data('index'),
                newViewIndex        = parseInt($(e.target).val());

        	this.model.moveModel(currentViewIndex, newViewIndex);
        }
    }, {
        templateSrc :   ' 	<div class="row-fluid">'+
                        '           	<label class="span10 offset1">SubView position</label>' +
                        '       	</div>' +
        				'   <div class="row-fluid">' +
        				'		<div class="block span10 offset1">' +
                        '       	<div class="row-fluid">' +
                        '				<table class="table table-striped">' +
                        '					<thead>'+
                        '						<tr>'+
                        '							<th>Element</th>'+
                        '							<th>Type</th>'+
                        '							<th>Position</th>'+
                        '						</tr>'+
                        '					</thead>' +
                        '					<tbody>'+
                        '						<% _.each(fields, function(el, idx) {  if (fields[idx] != undefined) { %>'+
                        '						<tr>'+
                        '							<td><%= el.get("label") %></td>'+
                        '							<td><%= el.constructor.type %></td>'+
                        '							<td>'+
                        '								<select class="positionOption" data-index="<%=idx %>">'+
                        '									<option value="0" <% if (idx == 0) {%> selected <% } %> >Top left corner</option>'+
                        '									<option value="1" <% if (idx == 1) {%> selected <% } %> >Top right corner</option>'+
                        '									<option value="2" <% if (idx == 2) {%> selected <% } %> >Bottom left corner</option>'+
                        '									<option value="3" <% if (idx == 3) {%> selected <% } %> >Bottom right corner</option>'+
                        '								</select>'+
                        '							</td>' +
                        '						</tr>'+
                    	'						<% } }); %>' +
                        '					</tbody>'+
                        '				</table>' +
                        '       	</div>' +
                        '   	</div>'+
                        '	</div>'
    });

    editionViews.SubformFieldEditView = editionViews.SimpleEditView.extend({

        events : function(){
            return _.extend({}, editionViews.SimpleEditView.prototype.events, {});
        },

    }, {
        templateSrc : '<div>'+
                        '   <h1 data-i18n="label.settings">Settings</h1>'+
                        '   <div>'+
                        '       <h2>'+
                        '           <span id="simple" class="selected" data-i18n="label.options.simple">Simple options</span> / '+
                        '           <span href="#" id="advanced" data-i18n="label.options.advanced" >Advanced options</span>'+
                        '       </h2>'+
                        '       <div class="hide advanced">' +
                        '           <div class="row-fluid">'+
                        '               <label class="span10 offset1">ID</label>' +
                        '           </div>' +
                        '           <div class="row-fluid">' +
                        '               <input class="span10 offset1 property" type="number" data-attr="id" placeholder="Id" value="<%= id %>" />' +
                        '           </div>' +
                        '       </div> ' +
                        '       <div>' +
                        '           <div class="row-fluid">'+
                        '               <label class="span10 offset1">Legend</label>' +
                        '           </div>' +
                        '           <div class="row-fluid">' +
                        '               <input class="span10 offset1 property" type="text" data-attr="legend" placeholder="Fieldset legend" value="<%= legend %>" />' +
                        '           </div>' +
                        '       </div> ' +
                         '   <div class="row-fluid">&nbsp;</div><div class="row-fluid">' +
                        '       <label class="span4 offset1">Multiple</label>' +
                        '           <input class="span2 property" data-attr="multiple" type="checkbox" <% if (multiple) { %> checked <% } %> />' +
                        '   </div>' +
                        '   </div>' +
                        '   <div class="row-fluid">&nbsp;</div>'+
                        '</div>'
    });


	return editionViews;
});