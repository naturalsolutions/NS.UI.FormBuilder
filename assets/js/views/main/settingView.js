define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.radio',
    'text!../../../templates/main/settingView.html',
    'jquery-ui',
    'i18n',
    'bootstrap-select',
    'perfect-scrollbar',
    'fuelux',
    'typeahead'
], function($, _, Backbone, Radio, settingTemplate) {

    var SettingView = Backbone.View.extend({

        /**
         * jQuery event triggered by the view
         * @type {Object}
         */
        events : {
            'change select'     : 'selectChanged',
            'click #cancel'     : 'cancel',
            'click #saveChange' : 'saveChange'
        },

        /**
         * Initialize setting view
         *
         * @param  {[Object]} options Initialization option like URL options and main HTML element
         */
        initialize : function(options) {

            this.el                = options.el;
            this.URL               = options.URL;
            this.template          = _.template(settingTemplate);
            this.form              = null;
            this.fieldWithSameType = null;

            //  Init backbone radio channel

            this.initMainChannel();
            this.initFormChannel();

            _.bindAll(this, 'render', 'createForm', 'initForm', 'selectChanged', 'removeForm', 'resetSelect', 'generateForm');
        },

        /**
         * Register settingView to main radio channel and listen event on main channel
         */
        initMainChannel : function() {
            this.mainChannel = Backbone.Radio.channel('global');

            this.mainChannel.on('saveConfiguration', _.bind(function() {
                this.mainChannel.trigger('fieldConfiguration', this.form.model.toJSON());
            }, this));

            this.mainChannel.on('getModel:return', _.bind(function(field) {
                //  Create form with model
                this.initForm(field);
            }, this));
        },

        /**
         *  Register the view to the form channel and listent on form channel
         */
        initFormChannel : function() {
            //  The form channel is used only for the main form object options
            //  save, export, clear and settings
            this.formChannel = Backbone.Radio.channel('form');

            //  Event is sent by formView when user wants to edit form configuration (name, description and keywords)
            this.formChannel.on('displaySettings', _.bind(function(formObject) {
                this.generateForm(formObject);
            }, this));
        },

        /**
         * Generate form for edit main form object properties
         *
         * @param  {Object} formSchema main form object schema
         */
        generateForm : function(formSchema) {

            $('*[data-setting="field"]').hide();

            require(['backbone-forms'], _.bind(function() {
                if (this.form !== null) {
                    //  Remove last form and create new with new model
                    this.removeForm()
                }

                this.form = new Backbone.Form({
                    model: formSchema,
                }).render();

                this.$el.find('#form').append(this.form.el)
                this.$el.find('.scroll').perfectScrollbar('update');
                this.$el.find('#getField').hide();

                //  Add pillbow for form keywords
                this.$el.find('.field-keywords input[type="text"]').pillbox();

                this.$el.find('.field-name input[type="text"]').typeahead({
                    source: _.bind(function(query, process) {
                        return $.getJSON(this.URL['protocolAutocomplete'], {query: query}, function(data) {
                            return process(data.options);
                        });
                    }, this)
                });

                this.$el.find('#pillboxkeywordsList input[type="text"]').typeahead({
                    source: _.bind(function(query, process) {
                        return $.getJSON(this.URL['keywordAutocomplete'], {query: query}, function(data) {
                            return process(data.options);
                        });
                    }, this),
                    updater: _.bind(function(item) {
                        this.$el.find('#pillboxkeywords').pillbox('addItems',-1, [{text :item, value : item}])

                        $('#pillboxkeywords .pill:last .glyphicon-close').replaceWith('<span class="reneco close" data-parent="' + item + '"></span>');
                    }, this)
                });

                this.$el.find('#pillboxkeywords').on('added.fu.pillbox', _.bind(function (evt, item) {
                  $('#pillboxkeywords .pill:last .glyphicon-close').replaceWith('<span class="reneco close" data-parent="' + item['text'] + '"></span>');
                }, this));

                this.$el.find('#pillboxkeywords').on('click', '.reneco', function() {
                    $('#pillboxkeywords').pillbox('removeByText', $(this).data('parent'));
                });

                this.mainChannel.trigger('formCreated');

            }, this));

        },

        /**
         * Check generated form values and send events if all is good
         * This function concerns generated form for field AND main form
         */
        saveChange : function() {
            var isValid = this.form.commit() === undefined;
            if (isValid) {
                if (this.$el.find('#getField').is(':visible')) {
                    this.mainChannel.trigger('formCommit')
                } else {
                    var values       = this.form.getValue(),
                        pillboxItems = $('#pillboxkeywords').pillbox('items');

                    values['keywords'] = _.map(pillboxItems, function(num){
                        return num['value'];
                    });

                    this.formChannel.trigger('edition', values);
                }

                this.removeForm();
            }
        },

        /**
         * Send an event on form channel when user wants to clear current form
         */
        cancel : function(){
            this.removeForm();
            this.mainChannel.trigger('formCancel')
        },

        /**
         * Render view
         *
         * @param  {[Object]} options Rendering otpions
         * @return {Object} return current view
         */
        render : function(options) {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            this.$el.find('.scroll').perfectScrollbar({
                suppressScrollX : true
            });
            return this;
        },

        /**
         * Create a form to edit field properties
         *
         * @param  {[Object]} field Field with which backbone forms will generate an edition form
         */
        initForm : function(field) {
            $.getJSON(this.URL.preConfiguredField, _.bind(function(fieldList) {

                this.fieldWithSameType = fieldList[field.constructor.type];
                this.resetSelect();

                _.each(this.fieldWithSameType, _.bind(function(el, idx) {

                    this.$el.find('select').append('<option value="' + idx + '">' + idx + '</option>');

                }, this));

            }, this)).fail( _.bind(function() {
                this.$el.find('select').append('<option>No field found</option>');
                this.$el.find('select').prop('disabled', true)
            }, this)).always(_.bind(function() {
                this.$el.find('#getField').show();
                this.$el.find('select').selectpicker();
                //  Always create form even if saved Field cannot be load
                this.createForm(field);

            }, this))
        },

        /**
         * Create a form to edit current collection properties (name, description and keywords)
         *
         * @param  {[Object]} field current main form (Backbone collection)
         */
        createForm : function(field) {

            $('*[data-setting="field"]').show();

            require(['backbone-forms', "backbone-forms-list", 'modalAdapter'], _.bind(function() {

                if (this.form !== null) {
                    //  Remove last form and create new with new model
                    this.removeForm()
                    this.form = new Backbone.Form({
                        model: field,
                    }).render();
                } else {
                    //  The form are not created yet
                    this.form = new Backbone.Form({
                        model: field,
                    }).render();
                }

                this.$el.find('#form').append(this.form.el)
                this.$el.find('.scroll').perfectScrollbar('update');

                this.mainChannel.trigger('formCreated');

                this.form.$el.on('change input[name="decimal"]', _.bind(function(e) {
                    if ($(e.target).is(':checked')) {
                        this.form.$el.find('.field-precision').addClass('advanced');
                    } else {
                        this.form.$el.find('.field-precision').removeClass('advanced');
                    }
                }, this))


                if (_.contains(['Thesaurus', 'AutocompleteTreeView'], field.constructor.type)) {

                    $.getJSON('ressources/thesaurus/thesaurus.json', _.bind(function(data) {

                        $('.settings form input[name="defaultNode"]').replaceWith('<div id="defaultNode"></div>');
                        $('.settings form #defaultNode').fancytree({
                            source: data['d'],
                            checkbox : false,
                            selectMode : 1,
                            activate : _.bind(function(event, data) {
                                this.mainChannel.trigger('nodeSelected' + field.get('id'), data);
                            }, this)
                        });

                    }, this)).error(function(a,b , c) {
                        alert ("can't load ressources !");
                    })

                } else if (field.constructor.type === 'TreeView') {

                    $('.settings form input[name="defaultNode"]').replaceWith('<div id="defaultNode"></div>');
                    $('.settings form #defaultNode').fancytree({
                        source: [
                            {title: "Node 1", key: "1"},
                            {title: "Folder 2", key: "2", folder: true, children: [
                                {title: "Node 2.1", key: "3"},
                                {title: "Node 2.2", key: "4"}
                            ]}
                        ],
                        selectMode : 1,
                        activate : _.bind(function(event, data) {
                            field.set('defaultNode', data.node.key)
                            this.mainChannel.trigger('nodeSelected' + field.get('id'), data);
                        }, this)
                    });

                }

            }, this));
        },

        /**
         * Remove the generated form and clear HTML element
         */
        removeForm : function() {
            this.$el.find('#form').html('');
            this.form.undelegateEvents();
            this.form.$el.removeData().unbind();
            this.form.remove();
            Backbone.View.prototype.remove.call(this.form);

            //  Update scrollBar
            this.$el.find('.scroll').scrollTop(0);
            this.$el.find('.scroll').perfectScrollbar('update');

            this.form = null;
        },

        /**
         * Reset the select element with pre configuration field name
         */
        resetSelect : function() {
            this.$el.find('select').html('<option value="" disabled selected>Select an option</option>');
        },

        /**
         * Event send when user change select value
         * Set value to the current vield
         *
         * @param  {[Object]} e jQuery event
         */
        selectChanged : function(e) {
            var choice = this.fieldWithSameType[ $(e.target).val() ];

            this.form.setValue(choice)
            if(_.contains(choice['validators'], "required")) {
                this.form.setValue({'required': true});
            }
        }

    });

    return SettingView;

});