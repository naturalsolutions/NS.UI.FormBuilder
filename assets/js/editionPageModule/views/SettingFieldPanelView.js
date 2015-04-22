define([
    'jquery',
    'marionette',
    'text!../templates/SettingFieldPanelView.html',
    'backbone.radio',
    '../../Translater',
    'jquery-ui',
    'i18n',
    'bootstrap-select',
    'slimScroll',
    'fuelux'
], function($, Marionette, SettingPanelViewTemplate, Radio, Translater) {

    var translater = Translater.getTranslater();

    /**
     * Setting view
     * This view display form (generated with backbone-forms) to edit form or field properties
     *
     * See collection/FieldCollection to see form schema
     * See models/Fields to see form schema for each field type like text field, number, etc ...
     */
    var SettingPanelView = Backbone.Marionette.ItemView.extend({


        /**
        * jQuery event triggered by the view
        * @type {Object}
        */
        events : {
            'change #getField select'     : 'selectChanged',
            'click #cancel'               : 'cancel',
            'click #saveChange'           : 'saveChange',
            'click #saveButton'           : 'saveField',
            'change .checkboxField input' : 'checkboxChange'
        },


        /**
        * Setting view template initialization
        */
        template : function() {
            return _.template(SettingPanelViewTemplate)({
                model : this.modelToEdit,
                type : this.modelToEdit.constructor.type.charAt(0).toLowerCase() + this.modelToEdit.constructor.type.slice(1)
            });
        },


        /**
        * View constructor, init grid channel
        */
        initialize : function(options) {
            this.fieldsList             = options.fieldsList;
            this.URLOptions             = options.URLOptions;
            this.modelToEdit            = options.modelToEdit;
            this.linkedFieldsList       = options.linkedFieldsList;
            this.preConfiguredFieldList = options.preConfiguredFieldList;

            this.form               = null;
            this.fieldWithSameType  = null;

            //  Init backbone radio channel
            this.initFormChannel();
            this.initMainChannel();

            _.bindAll(this, 'template', 'initForm');
        },


        /**
        * Init main radio channel for communicate in the editionPageModule
        */
        initMainChannel : function() {
            //  The edition channel is the main channel ONLY in the editionPageModule
            this.mainChannel = Backbone.Radio.channel('edition');
        },


        /**
         * Init form channel
         * This channel concerns only form functionnality like create a form to edit model
         */
        initFormChannel : function() {
            //  The form channel is used only for the main form object options
            //  save, export, clear and settings
            this.formChannel = Backbone.Radio.channel('form');
        },


        /**
        * Create a form to edit field properties
        *
        * @param  {Object} field Field with which backbone forms will generate an edition form
        */
        initForm : function() {
            this.currentFieldType  = this.modelToEdit.constructor.type;
            this.fieldWithSameType = this.preConfiguredFieldList[this.currentFieldType];

            if (this.fieldWithSameType == undefined) {
                this.$el.find('*[data-setting="field"]').hide();
            } else {
                // Update available pre configurated field
                _.each(this.fieldWithSameType, _.bind(function(el, idx) {
                    this.$el.find('#getField select').append('<option value="' + idx + '">' + idx + '</option>');
                }, this));
            }

            this.$el.find('select').selectpicker();

            this.createForm();
        },

        /**
        * Create a form to edit field properties
        *
        * @param  {[Object]} field to edit
        */
        createForm : function() {

            require(['backbone-forms', "backbone-forms-list", 'modalAdapter'], _.bind(function() {

                this.form = new Backbone.Form({
                    model: this.modelToEdit
                }).render();

                var linkedFieldsKeyList = [];
                _.each(this.linkedFieldsList.linkedFieldsList, function(el, idx) {
                    linkedFieldsKeyList.push(el.key)
                });

                if (! _.contains(['Subform'], this.modelToEdit.constructor.type)) {
                    if (this.fieldsList.length > 0) {
                        //  Update linked fields
                        this.form.fields.linkedField.editor.setOptions(linkedFieldsKeyList);
                        this.form.fields.formIdentifyingColumn.editor.setOptions(this.fieldsList);
                        this.form.fields.linkedFieldTable.editor.setOptions(this.linkedFieldsList.tablesList);
                        this.form.fields.linkedFieldIdentifyingColumn.editor.setOptions(this.linkedFieldsList.identifyingColumns);
                    } else {
                        //  In this case there is only one field in the form so it can't be a linked field
                        //  We add hide class to hide editor
                        this.form.fields.linkedField.$el.addClass('hide');
                        this.form.fields.formIdentifyingColumn.$el.addClass('hide');
                        this.form.fields.linkedFieldTable.$el.addClass('hide');
                        this.form.fields.linkedFieldIdentifyingColumn.$el.addClass('hide');
                    }
                }                

                this.$el.find('#form').append(this.form.el)

                // Send an event to editionPageLayout to notify that form is created
                this.mainChannel.trigger('formCreated');


                 this.form.$el.on('change input[name="decimal"]', _.bind(function(e) {
                    if ($(e.target).is(':checked')) {
                        this.form.$el.find('.field-precision').addClass('advanced');
                    } else {
                        this.form.$el.find('.field-precision').removeClass('advanced');
                    }
                }, this))

                 if (_.contains(['Thesaurus', 'AutocompleteTreeView'], this.modelToEdit.constructor.type)) {

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

                } else if (this.modelToEdit.constructor.type === 'TreeView') {

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
         * Remove last form and clean html content
         */
        removeForm : function() {
            //  I know it's bad but it works for the moment ;)
            setTimeout(_.bind(function() {
                this.$el.find('#form').html('');
                this.form.undelegateEvents();
                this.form.$el.removeData().unbind();
                this.form.remove();
                Backbone.View.prototype.remove.call(this.form);

                //  Update scrollBar
                this.$el.find('.scroll').scrollTop(0);
                this.$el.find('.scroll').slimScroll('update');

                this.form = null;
            }, this), 300);
            //  My prefered music for developpement
            //  https://www.youtube.com/watch?v=YKhNbKplIYA
        },


        /**
        * Reset the select element with pre configuration field name
        */
        resetSelect : function() {
            this.$el.find('#getField select').html('<option value="" disabled selected>Select an option</option>');
        },

        /**
        * View rendering callbak
        */
        onRender : function(options) {
            this.$el.i18n();
            this.$el.find('.scroll').slimScroll({
                height : '100%'
            });
            this.initForm();
        },

        /**
        * Event send when user change select value
        * Set value to the current vield
        *
        * @param  {Object} e jQuery event
        */
        selectChanged : function(e) {
            var choice = this.fieldWithSameType[ $(e.target).val() ];

            this.form.setValue(choice)

            if(_.contains(choice['validators'], "required")) {
                this.form.setValue({'required': true});
                this.$el.find('input[name="required"]').prop('checked', true)
            } else {
                this.form.setValue({'required': false});
                this.$el.find('input[name="required"]').prop('checked', false)
            }

            this.$el.find('input[name="endOfLine"]').prop('checked', choice['endOfLine'] != undefined)
        },


        /**
        * Send an event on form channel when user wants to clear current form
        */
        cancel : function(){
            this.removeForm();
            this.mainChannel.trigger('formCancel')
        },


        /**
        * Check generated form values and send events if all is good
        * This function concerns generated form for field AND main form
        */
        saveChange : function() {
            if (this.form.commit() === undefined) {
                this.mainChannel.trigger('formCommit')
                this.removeForm();
            }
        },


        /**
        * Save current field as a configuration field
        */
        saveField : function() {
            var formCommitResult = this.form.commit();
            if (formCommitResult) {

                //  If something wrong we move to the first incorrect field
                var offsetTop = $('input[name="' + Object.keys(formCommitResult)[0] + '"]').offset().top;
                this.$el.find('.scroll').scrollTop( offsetTop );
                this.$el.find('.scroll').slimScroll('update');

            } else {
                var formValue = this.form.getValue();

                this.requestChannel.trigger('saveConfiguration', {
                    type    : this.currentFieldType,
                    name    : formValue['name'],
                    content : formValue
                });
            }
        },


        /**
        * Change a checkbox state
        */
        checkboxChange : function(e) {
            $('label[for="' + $(e.target).prop('id') + '"]').toggleClass('selected')
        }

    });

    return SettingPanelView;

});
