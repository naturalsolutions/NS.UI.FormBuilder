define([
    'jquery',
    'marionette',
    'text!../templates/SettingFieldPanelView.html',
    'backbone.radio',
    'jquery-ui',
    'i18n',
    'bootstrap-select',
    'perfect-scrollbar',
    'fuelux'
], function($, Marionette, SettingPanelViewTemplate, Radio) {

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
            'change select'               : 'selectChanged',
            'click #cancel'               : 'cancel',
            'click #saveChange'           : 'saveChange',
            'click #saveButton'           : 'saveField',
            'change .checkboxField input' : 'checkboxChange'
        },


        /**
        * Setting view template initialization
        */
        template : function() {
            return _.template(SettingPanelViewTemplate)();
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

            //this.mainChannel.on('saveConfiguration', this.saveConfiguration, this);

            //  Create a form with backbone forms for field in parameter
            //  See createFormForField function
            //this.mainChannel.on('getModel:return', this.createFormForField, this);
        },


        /**
         * Init form channel
         * This channel concerns only form functionnality like create a form to edit model
         */
        initFormChannel : function() {
            //  The form channel is used only for the main form object options
            //  save, export, clear and settings
            this.formChannel = Backbone.Radio.channel('form');

            this.formChannel.on('modelToEdit', this.displayModelForm, this)

            //  Event is sent by formView when user wants to edit form configuration (name, description and keywords)
            this.formChannel.on('displaySettings', this.createFormForCollection, this);
        },


        /**
        * Generate a form with backbone forms for edit form properties : label, keywords, description ...
        *
        * @param  {Object} formObject Form object (contains backbone-form schema)
        */
        createFormForCollection : function(formObject) {
            this.generateForm(formObject);
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
                })

                //  Update linked fields
                this.form.fields.linkedField.editor.setOptions(linkedFieldsKeyList);
                this.form.fields.formIdentifyingColumn.editor.setOptions(this.fieldsList);
                this.form.fields.linkedFieldTable.editor.setOptions(this.linkedFieldsList.tablesList);
                this.form.fields.linkedFieldIdentifyingColumn.editor.setOptions(this.linkedFieldsList.identifyingColumns);

                this.$el.find('#form').append(this.form.el)
                this.$el.find('.scroll').perfectScrollbar('update');

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
                this.$el.find('.scroll').perfectScrollbar('update');

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
         * Display form for edit model in parameter
         *
         * @param {Object} modelToEdit Field to edit
         */
        displayModelForm : function(modelToEdit) {
            this.initForm(modelToEdit);
        },


        /**
        * View rendering callbak
        */
        onRender : function(options) {
            this.$el.i18n();
            this.$el.find('.scroll').perfectScrollbar();
            this.initForm();
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
            var isValid;

            if (this.$el.find('#getField').is(':visible')) {
                isValid = this.form.commit() === undefined;
            } else {
                isValid = this.form.validate() === null;
            }

            if (isValid) {
                if (this.$el.find('#getField').is(':visible')) {
                    this.mainChannel.trigger('formCommit')
                } else {
                    var values       = this.form.getValue(),
                    pillboxItems = $('#pillboxkeywords').pillbox('items');

                    values['keywords'] = _.map(pillboxItems, function(num){
                        return num['value'];
                    });
                    this.mainChannel.trigger('editionDone', values);
                }

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
                this.$el.find('.scroll').perfectScrollbar('update');

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
                    schema: formSchema.schema,
                    data : formSchema.getAttributesValues()
                }).render();

                this.$el.find('#form').append(this.form.el)
                this.$el.find('.scroll').perfectScrollbar('update');
                this.$el.find('#getField').hide();

                //  Add pillbow for form keywords
                this.$el.find('.field-keywords input[type="text"]').pillbox();

                this.$el.find('#pillboxkeywordsFr').find('input[type="text"]').prop('placeholder', $.t('form.keywords.action'))
                this.$el.find('#pillboxkeywordsEn').find('input[type="text"]').prop('placeholder', $.t('form.keywords.action'))

                this.$el.find('.field-name input[type="text"]').autocomplete({
                    minLength : 1,
                    scrollHeight: 220,
                    appendTo : '.field-name',
                    source : _.bind(function(req, add) {
                        return $.getJSON(this.URLOptions['protocolAutocomplete'], function(data) {
                            var res = [];
                            for ( var each in data.options) {
                                if (data.options[each].indexOf(req.term) > 0) {
                                    res.push(data.options[each])
                                }
                            }
                            return add(res);
                        });
                    }, this)
                });

                this.$el.find('#pillboxkeywordsFr input[type="text"]').autocomplete({
                    minLength : 1,
                    scrollHeight: 220,
                    appendTo : '#pillboxkeywordsFr',
                    source : _.bind(function(req, add) {
                        return $.getJSON(this.URLOptions['keywordAutocomplete'], function(data) {
                            var res = [];
                            for ( var each in data.options) {
                                if (data.options[each].indexOf(req.term) > 0) {
                                    res.push(data.options[each])
                                }
                            }
                            return add(res);
                        });
                    }, this)
                });

                this.$el.find('#pillboxkeywordsEn input[type="text"]').autocomplete({
                    minLength : 1,
                    scrollHeight: 220,
                    appendTo : '#pillboxkeywordsEn',
                    source : _.bind(function(req, add) {
                        return $.getJSON(this.URLOptions['keywordAutocomplete'], function(data) {
                            var res = [];
                            for ( var each in data.options) {
                                if (data.options[each].indexOf(req.term) > 0) {
                                    res.push(data.options[each])
                                }
                            }
                            return add(res);
                        });
                    }, this)
                });

                /*this.$el.find('#pillboxkeywordsFr input[type="text"], #pillboxkeywordsEn input[type="text"]').typeahead({
                    source: _.bind(function(query, cb) {
                        return $.getJSON(this.URLOptions['keywordAutocomplete'], {query: query}, function(data) {
                            return cb(data.options);
                        });
                    }, this),
                    updater: (function(item) {
                        this.$element.parents('.pillbox').pillbox('addItems',-1, [{text :item, value : item}])
                        this.$element.parents('.pillbox').find('.pill:last .glyphicon-close').replaceWith('<span class="reneco close" data-parent="' + item + '"></span>');
                    })
                });*/

                this.$el.find('#pillboxkeywordsFr, #pillboxkeywordsEn').on('added.fu.pillbox', _.bind(function (evt, item) {
                    $('.glyphicon-close').replaceWith('<span class="reneco close" data-parent="' + item['text'] + '"></span>');
                }, this));

                this.$el.find('#pillboxkeywordsFr, #pillboxkeywordsEn').on('click', '.reneco', function(evt) {
                    $(this).parents('div.pillbox').pillbox('removeByText', $(this).data('parent'));
                });

                this.mainChannel.trigger('formCreated');

            }, this));

        }

    });

    return SettingPanelView;

});
