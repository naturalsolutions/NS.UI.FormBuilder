define([
    'jquery',
    'underscore',
    'backbone',
    'backbone.radio',
    'text!../../../templates/main/settingView.html',
    'jquery-ui',
    'i18n',
    'bootstrap-select',
    'perfect-scrollbar'
], function($, _, Backbone, Radio, settingTemplate) {

    var SettingView = Backbone.View.extend({

        events : {
            'change select' : 'selectChanged',
            'click #cancel' : 'cancel',
            'click #saveChange' : 'saveChange'
        },

        initialize : function(options) {

            this.el       = options.el;
            this.URL      = options.URL;
            this.template = _.template(settingTemplate);
            this.form     = null;

            //  Init radio channel
            this.mainChannel = Backbone.Radio.channel('global');



            this.mainChannel.on('saveConfiguration', _.bind(function() {
                this.mainChannel.trigger('fieldConfiguration', this.form.model.toJSON());
            }, this));

            this.mainChannel.on('getModel:return', _.bind(function(field) {
                //  Create form with model
                this.initForm(field);
            }, this));

            //  -----------------------------------------------------
            //  Form channel configuration


            //  The form channel is used only for the main form object options
            //  save, export, clear and settings
            this.formChannel = Backbone.Radio.channel('form');

            this.formChannel.on('displaySettings', _.bind(function(formObject) {
                //  Get form schema for backbone forms
                var formSchema = formObject.schema;

                this.generateForm(formSchema);
            }, this));

            this.fieldWithSameType = null;

            _.bindAll(this, 'render', 'createForm', 'initForm', 'selectChanged', 'removeForm', 'resetSelect', 'generateForm');
        },


        /**
         * Generate form for edit main form object properties
         *
         * @param  {Object} formSchema main form object schema
         */
        generateForm : function(formSchema) {

            require(['backbone-forms'], _.bind(function() {
                if (this.form !== null) {
                    //  Remove last form and create new with new model
                    this.removeForm()
                }

                this.form = new Backbone.Form({
                    schema: formSchema,
                }).render();

                this.$el.find('#form').append(this.form.el)
                this.$el.find('#getField').hide();
                this.mainChannel.trigger('formCreated');
            }, this));

        },


        saveChange : function() {
            var isValid = this.form.commit() === undefined;
            if (isValid) {
                this.removeForm();
                this.mainChannel.trigger('formCommit', isValid)
            }
        },

        cancel : function(){
            this.removeForm();
            this.mainChannel.trigger('formCancel')
        },

        render : function(options) {
            var renderedContent = this.template();
            $(this.el).html(renderedContent);
            this.$el.find('.scroll').perfectScrollbar({
                suppressScrollX : true
            });
            return this;
        },

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
                this.$el.find('select').selectpicker();
                //  Always create form even if saved Field cannot be load
                this.createForm(field);

            }, this))
        },

        createForm : function(field) {
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

                $('.settings #form').append(this.form.el)

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

        removeForm : function() {
            this.form.undelegateEvents();
            this.form.$el.removeData().unbind();
            this.form.remove();
            Backbone.View.prototype.remove.call(this.form);
            this.form = null;
            this.$el.find('#form').html('');
        },

        resetSelect : function() {
            this.$el.find('select').html('<option value="" disabled selected>Select an option</option>');
        },

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